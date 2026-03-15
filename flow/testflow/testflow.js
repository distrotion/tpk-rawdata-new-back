const express = require("express");
const router = express.Router();
const mssql = require('./../../function/mssql');
const mssqlR = require('./../../function/mssqlR');
const mongodb = require('./../../function/mongodb');
const httpreq = require('./../../function/axios');
const axios = require('axios');


router.get('/testflow', async (req, res) => {
  let output = await mssql.qurey(`SELECT * From [test].[dbo].[Table01]`);
  res.json(output);
});

router.post('/login', async (req, res) => {
  // [FIX] CRITICAL: เพิ่ม let ให้ตัวแปร ป้องกัน implicit global variable
  let input = req.body;
  let output = {};

  if (input.user === "arsa") {
    if (input.password === '1234') {
      output.Status = 'ok';
      output.Roleid = 5;
      output.Name = 'Arsa';
    } else {
      output.Status = 'nok';
    }
  } else {
    output.Status = 'nok';
  }

  res.json(output);
});

router.post('/logindb', async (req, res) => {
  // [FIX] CRITICAL: เพิ่ม let ให้ตัวแปร ป้องกัน implicit global variable
  let input = req.body;
  let output = {};

  // [FIX] CRITICAL: SQL Injection — เปลี่ยนจาก string interpolation เป็น parameterized query
  // เดิม: `SELECT * ... where [user]='${input.user}'` — อันตรายมาก
  let db = await mssqlR.qureyRParam(
    `SELECT * From [test].[dbo].[Table01] where [user]=@user`,
    { user: input.user }
  );

  if (db.error) {
    output.Status = 'nok';
    return res.json(output);
  }

  if (db.recordset && db.recordset.length > 0) {
    if (input.user === db.recordset[0].user) {
      if (input.password === db.recordset[0].password) {
        output.Status = 'ok';
        output.Roleid = db.recordset[0].Roleid;
        output.Name = db.recordset[0].user;
      } else {
        output.Status = 'nok';
      }
    } else {
      output.Status = 'nok';
    }
  } else {
    output.Status = 'nok';
  }

  return res.json(output);
});


router.get('/mongotest', async (req, res) => {
  await mongodb.update("test", "doc01", { "data": 2 }, { $set: { b: 777 } });
  let output = await mongodb.find("test", "doc01", { "data": 2 });
  return res.json(output);
});

router.get('/testreq', async (req, res) => {
  // [FIX] เพิ่ม let ให้ตัวแปร
  let data = { "test": "haha" };
  let output = await httpreq.post('http://127.0.0.1:7510/testpost', data);
  return res.send(output);
});


function test(x) {
  x++;
  return x;
}

router.get('/fntest', async (req, res) => {
  // [FIX] เพิ่ม let ให้ตัวแปร
  let out = test(1);
  console.log(out);
  // [FIX] ERROR: ลบ console.log(out2) — ตัวแปร out2 ไม่มีการประกาศ จะ throw ReferenceError
  res.send(`${out}`);
});

router.get('/fntest2', async (req, res) => {
  // [FIX] เพิ่ม let ให้ตัวแปร
  let out = test(2);
  console.log(out);
  res.send(`${out}`);
});

router.get('/posthttptest', async (req, res) => {
  // [FIX] RACE CONDITION: เดิมส่ง res.send() ทันทีก่อน callback ทำงานเสร็จ
  // แก้โดยใช้ axios ซึ่งรองรับ async/await ได้โดยตรง
  try {
    let resp = await axios.post(
      'http://172.101.1.19/API_QcReport/ZBAPI_getZPPIN013_OUT',
      {}
    );
    return res.send(`${resp.data}`);
  } catch (err) {
    console.error('[posthttptest] Error:', err.message);
    return res.status(500).json({ error: 'Request failed' });
  }
});


router.get('/postaxiostest', async (req, res) => {
  try {
    let resp = await axios.post('http://172.101.1.19/API_QcReport/ZBAPI_getZPPIN013_OUT', {
      "IMP_PRCTR": "24000",
      "IMP_WERKS": "2100",
      "LAST_DATE": "01-01-2022",
      "LAST_TIME": "15:30:10"
    });

    let output = '';
    if (resp.status === 200) {
      output = resp.data.replace(`\"`, '"');
    }
    return res.send(`${output}`);
  } catch (err) {
    // [FIX] ERROR: เดิมใช้ throw getError(err) — getError ไม่ได้นิยามไว้ จะ crash
    console.error('[postaxiostest] Error:', err.message);
    return res.status(500).json({ error: 'Request failed' });
  }
});

module.exports = router;
