const express = require("express");
const router = express.Router();
var mssql = require('../../function/mssql');
var mssqlR = require('../../function/mssqlR');
var mongodb = require('../../function/mongodb');

var mongodbBP12PH = require('../../function/mongodbBP12PH');
var mongodbBP12GAS = require('../../function/mongodbBP12GAS');
var mongodbGWGAS = require('../../function/mongodbGWGAS');
var mongodbHESGAS = require('../../function/mongodbHESGAS');
var mongodbHESISN = require('../../function/mongodbHESISN');
var mongodbHESPAL = require('../../function/mongodbHESPAL');
var mongodbHESPH = require('../../function/mongodbHESPH');

var mongodbBP12KNG = require('../../function/mongodbBP12KNG');
var mongodbBP12PVD = require('../../function/mongodbBP12PVD');

var httpreq = require('../../function/axios');
var axios = require('axios');

// [FIX] PERF: Plant Map — แทน if-else chain 10+ branches ด้วย O(1) lookup
const plantModuleMap = {
  "BP12PH":  mongodbBP12PH,
  "BP12PAL": mongodbBP12PH,   // BP12PAL ใช้ server เดียวกับ BP12PH
  "BP12GAS": mongodbBP12GAS,
  "GWGAS":   mongodbGWGAS,
  "HESGAS":  mongodbHESGAS,
  "HESISN":  mongodbHESISN,
  "HESPAL":  mongodbHESPAL,
  "HESPH":   mongodbHESPH,
  "BP12KNG": mongodbBP12KNG,
  "BP12PVD": mongodbBP12PVD,
};


router.get('/RAWDATA/version', async (req, res) => {
  // console.log(mssql.qurey())
  res.json("RAWDATA v0.1");
})

router.post('/RAWDATA/getplant', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/getplant--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()


  //-------------------------------------
  return res.json(date);
});



router.post('/RAWDATA/getitems', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/getitems--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()


  //-------------------------------------
  return res.json(date);
});



router.post('/RAWDATA/sapget', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/sapget--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = [];
  if (input[`ORDER`] !== undefined) {


    try {
      let resp = await axios.post('http://tp-portal.thaiparker.co.th/API_QcReport/ZBAPI_QC_INTERFACE', {
        "BAPI_NAME": "ZPPIN011_OUT",
        "IMP_TEXT02": input[`ORDER`],
        "TABLE_NAME": "PPORDER"
      });
      if (resp.status == 200) {
        let returnDATA = resp.data;
        output = returnDATA["Records"] || []
        //  console.log(output)
      }
    } catch (err) {
      output = [];
    }

  }


  //-------------------------------------
  return res.json(output);
});

router.post('/RAWDATA/Getinstrument', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/Getinstrument--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  // let date = Date.now()
  // console.log("-------->>");
  let output = [];
  // [FIX] PERF: ใช้ plantModuleMap แทน if-else chain 10 branches → O(1) lookup
  if (input['PLANT'] !== undefined && plantModuleMap[input['PLANT']]) {
    output = await plantModuleMap[input['PLANT']].find("master_FN", "INSTRUMENTS", {});
  }


  //-------------------------------------
  return res.json(output);
});

router.post('/RAWDATA/Getitems', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/Getitems--");
  let input = req.body;
  //-------------------------------------
  let output = [];
  // [FIX] PERF: ใช้ plantModuleMap แทน if-else chain 10 branches → O(1) lookup
  if (input['PLANT'] !== undefined && plantModuleMap[input['PLANT']]) {
    output = await plantModuleMap[input['PLANT']].find("master_FN", "INSTRUMENTS", {});
  }


  //-------------------------------------
  return res.json(output);
});

router.post('/RAWDATA/Getitemslist', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/Getitemslist--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  // let date = Date.now()
  let output = [];
  let buff01 = [];
  let ITEMMASTER = [];
  // [FIX] PERF: ใช้ plantModuleMap + Promise.all ทำ 2 queries พร้อมกัน
  // เดิม: 2 sequential await → ต้องรอ query 1 เสร็จก่อน query 2 ถึงจะเริ่ม
  // ใหม่: ยิง 2 queries พร้อมกัน → ลด latency ครึ่งหนึ่ง
  if (input['PLANT'] !== undefined && input['CP'] !== undefined &&
      input['PCDATA'] !== undefined && input['PCDATAL'] !== undefined &&
      plantModuleMap[input['PLANT']]) {
    const mod = plantModuleMap[input['PLANT']];
    [buff01, ITEMMASTER] = await Promise.all([
      mod.find("PATTERN", "PATTERN_01", { "CP": `${input['CP']}` }),
      mod.find(`${input['PCDATA']}`, "ITEMs", {})
    ]);

    if(buff01.length>0){
      if(buff01[0][`${input['PCDATAL']}`] != undefined){

        let indata = buff01[0][`${input['PCDATAL']}`];

        for (let i = 0; i < indata.length; i++) {
          output.push({"Items": indata[i]['ITEMs']})
        }

        // [FIX] PERF: เปลี่ยนจาก O(n²) nested loop เป็น Map lookup O(n)
        // เดิม: วน loop ซ้อน output × ITEMMASTER → ช้ามากเมื่อข้อมูลเยอะ
        const itemMap = new Map(ITEMMASTER.map(m => [m['masterID'], m['ITEMs']]));
        for (let j = 0; j < output.length; j++) {
          const name = itemMap.get(output[j]['Items']);
          if (name !== undefined) {
            output[j]['ItemsName'] = name;
          }
        }
      }
    }



  }


  //-------------------------------------
  return res.json(output);
});

router.post('/RAWDATA/insertdata', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/insertdata--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()

  // ,[Location]
  //     ,[Plant]
  //     ,[Order]
  //     ,[CP]
  //     ,[FG]
  //     ,[ItemsCode]
  //     ,[ItemsName]
  //     ,[DataNo]
  //     ,[Data]
  //     ,[Picture]
  //     ,[UserInput]
  //mssqlR
  if(input["Location"] != undefined && input["Plant"] != undefined&& input["Order"] != undefined&& input["CP"] != undefined&& input["FG"] != undefined&& input["ItemsCode"] != undefined&& input["ItemsName"] != undefined&& input["NUMBER"] != undefined&& input["POINT"] != undefined&& input["Data"] != undefined&& input["Picture"] != undefined&& input["SEQ"] != undefined   && input["QTYT"] != undefined && input["UNIT"] != undefined  && input["CUSTNA"] != undefined && input["PARTNA"] != undefined  && input["PARTNO"] != undefined && input["PROC"] != undefined  && input["CUSLOTNO"] != undefined && input["FG_CHARG"] != undefined && input["CUST_FULLNM"] != undefined&& input["TYPE"] != undefined&& input["INSTRUMENT"] != undefined && input["SP02"] != undefined ){
    let queryS = `INSERT INTO [RAWDATA].[dbo].[autorawdata]
    ([Location],[Plant],[Order],[CP],[FG],[ItemsCode],[ItemsName],[NUMBER],[POINT],[Data],[Picture],[UserInput],[SEQ],[QTYT],[UNIT],[CUSTNA],[PARTNA],[PARTNO],[PROC],[CUSLOTNO],[FG_CHARG],[CUST_FULLNM],[TYPE],[SP01],[SP02])
    VALUES (@Location,@Plant,@Order,@CP,@FG,@ItemsCode,@ItemsName,@NUMBER,@POINT,@Data,@Picture,@UserInput,@SEQ,@QTYT,@UNIT,@CUSTNA,@PARTNA,@PARTNO,@PROC,@CUSLOTNO,@FG_CHARG,@CUST_FULLNM,@TYPE,@INSTRUMENT,@SP02);`;
    let params = {
      Location: input["Location"], Plant: input["Plant"], Order: input["Order"], CP: input["CP"],
      FG: input["FG"], ItemsCode: input["ItemsCode"], ItemsName: input["ItemsName"], NUMBER: input["NUMBER"],
      POINT: input["POINT"], Data: input["Data"], Picture: input["Picture"], UserInput: input["UserInput"],
      SEQ: input["SEQ"], QTYT: input["QTYT"], UNIT: input["UNIT"], CUSTNA: input["CUSTNA"],
      PARTNA: input["PARTNA"], PARTNO: input["PARTNO"], PROC: input["PROC"], CUSLOTNO: input["CUSLOTNO"],
      FG_CHARG: input["FG_CHARG"], CUST_FULLNM: input["CUST_FULLNM"], TYPE: input["TYPE"],
      INSTRUMENT: input["INSTRUMENT"], SP02: input["SP02"]
    };
    console.log(queryS)
    let db = await mssqlR.qureyRParam(queryS, params);
    console.log(db)
    if (db['recordsets'].length > 0) {
      let datadb = db['recordsets'][0];
      output = datadb
    }
  }
  


  //-------------------------------------
  return res.json(date);
});

router.post('/RAWDATA/getdata', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/getdata--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()
  let output = []
  // ,[Location]
  //     ,[Plant]
  //     ,[Order]
  //     ,[CP]
  //     ,[FG]
  //     ,[ItemsCode]
  //     ,[ItemsName]
  //     ,[DataNo]
  //     ,[Data]
  //     ,[Picture]
  //     ,[UserInput]
  //mssqlR
  if(input["Order"] != undefined&& input["NUMBER"] != undefined&& input["TYPE"] != undefined){
    let queryS = `SELECT * FROM [RAWDATA].[dbo].[autorawdata] where [Order]=@Order AND [NUMBER]=@NUMBER AND [TYPE]=@TYPE order by date desc`;
    let params = { Order: input["Order"], NUMBER: input["NUMBER"], TYPE: input["TYPE"] };
    console.log(queryS)
    let db = await mssqlR.qureyRParam(queryS, params);
    // console.log(db)
    if (db['recordsets'].length > 0) {
      let datadb = db['recordsets'][0];
      output = datadb
    }
  }
  


  //-------------------------------------
  return res.json(output);
});


router.post('/RAWDATA/getdataall', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/getdataall--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()

  // ,[Location]
  //     ,[Plant]
  //     ,[Order]
  //     ,[CP]
  //     ,[FG]
  //     ,[ItemsCode]
  //     ,[ItemsName]
  //     ,[DataNo]
  //     ,[Data]
  //     ,[Picture]
  //     ,[UserInput]
  //mssqlR
  if(input["Order"] != undefined&& input["TYPE"] != undefined){
    let queryS = `SELECT * FROM [RAWDATA].[dbo].[autorawdata] where [Order]=@Order AND [TYPE]=@TYPE order by date desc`;
    let params = { Order: input["Order"], TYPE: input["TYPE"] };
    console.log(queryS)
    let db = await mssqlR.qureyRParam(queryS, params);
    console.log(db)
    if (db['recordsets'].length > 0) {
      let datadb = db['recordsets'][0];
      output = datadb
    }
  }
  


  //-------------------------------------
  return res.json(output);
});

router.post('/RAWDATA/getrawreport', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/getrawreport--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()

  // ,[Location]
  //     ,[Plant]
  //     ,[Order]
  //     ,[CP]
  //     ,[FG]
  //     ,[ItemsCode]
  //     ,[ItemsName]
  //     ,[DataNo]
  //     ,[Data]
  //     ,[Picture]
  //     ,[UserInput]
  //mssqlR
  if(input["Order"] != undefined){
    let queryS = `SELECT * FROM [RAWDATA].[dbo].[autorawdata] where [Order]=@Order order by date desc`;
    let params = { Order: input["Order"] };
    console.log(queryS)
    let db = await mssqlR.qureyRParam(queryS, params);
    console.log(db)
    if (db['recordsets'].length > 0) {
      let datadb = db['recordsets'][0];
      output = datadb
    }
  }



  //-------------------------------------
  return res.json(output);
});

router.post('/RAWDATA/DELETELASTrawreport', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/DELETELASTrawreport--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()
  let output = [];

  // ,[Location]
  //     ,[Plant]
  //     ,[Order]
  //     ,[CP]
  //     ,[FG]
  //     ,[ItemsCode]
  //     ,[ItemsName]
  //     ,[DataNo]
  //     ,[Data]
  //     ,[Picture]
  //     ,[UserInput]
  //mssqlR
  if(input["Order"] != undefined){
    let queryS = `DELETE FROM [RAWDATA].[dbo].[autorawdata]
                  WHERE [date] IN (
                      SELECT TOP 1 [date]
                      FROM [RAWDATA].[dbo].[autorawdata]
                      WHERE [Order] = @Order
                      ORDER BY [date] DESC
                  );`;
    let params = { Order: input["Order"] };
    console.log(queryS)
    let db = await mssqlR.qureyRParam(queryS, params);
    console.log(db)
    // if (db['recordsets'].length > 0) {
    //   let datadb = db['recordsets'][0];
    //   output = datadb
    // }
  }
  


  //-------------------------------------
  return res.json(output);
});

// delete from marks order by id desc limit 1

router.post('/RAWDATA/COPPY', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/COPPY--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()

  // ,[Location]
  //     ,[Plant]
  //     ,[Order]
  //     ,[CP]
  //     ,[FG]
  //     ,[ItemsCode]
  //     ,[ItemsName]
  //     ,[DataNo]
  //     ,[Data]
  //     ,[Picture]
  //     ,[UserInput]
  //mssqlR
  // if(input["Location"] != undefined && input["Plant"] != undefined&& input["Order"] != undefined&& input["CP"] != undefined&& input["FG"] != undefined&& input["ItemsCode"] != undefined&& input["ItemsName"] != undefined&& input["NUMBER"] != undefined&& input["POINT"] != undefined&& input["Data"] != undefined&& input["Picture"] != undefined&& input["SEQ"] != undefined   && input["QTYT"] != undefined && input["UNIT"] != undefined  && input["CUSTNA"] != undefined && input["PARTNA"] != undefined  && input["PARTNO"] != undefined && input["PROC"] != undefined  && input["CUSLOTNO"] != undefined && input["FG_CHARG"] != undefined && input["CUST_FULLNM"] != undefined&& input["TYPE"] != undefined&& input["INSTRUMENT"] != undefined && input["SP02"] != undefined ){
  //   let queryS = `INSERT INTO [RAWDATA].[dbo].[autorawdata] 
  //   ([Location],[Plant],[Order],[CP],[FG],[ItemsCode],[ItemsName],[NUMBER],[POINT],[Data],[Picture],[UserInput] ,[SEQ],[QTYT],[UNIT],[CUSTNA],[PARTNA],[PARTNO],[PROC],[CUSLOTNO],[FG_CHARG],[CUST_FULLNM],[TYPE],[SP01],[SP02]) 
  //   VALUES ('${input["Location"]}','${input["Plant"]}','${input["Order"]}','${input["CP"]}','${input["FG"]}','${input["ItemsCode"]}','${input["ItemsName"]}','${input["NUMBER"]}','${input["POINT"]}','${input["Data"]}','${input["Picture"]}','${input["UserInput"]}','${input["SEQ"]}','${input["QTYT"]}','${input["UNIT"]}','${input["CUSTNA"]}','${input["PARTNA"]}','${input["PARTNO"]}','${input["PROC"]}','${input["CUSLOTNO"]}','${input["FG_CHARG"]}','${input["CUST_FULLNM"]}','${input["TYPE"]}','${input["INSTRUMENT"]}','${input["SP02"]}');`;

  //   console.log(queryS)
  //   let db = await mssqlR.qureyR(queryS);
  //   console.log(db)
  //   if (db['recordsets'].length > 0) {
  //     let datadb = db['recordsets'][0];
  //     output = datadb
  //   }
  // }

  if(input["OrderORIGIN"] != undefined && input["OrderNEW"] != undefined){
    let queryS = `SELECT * FROM [RAWDATA].[dbo].[autorawdata] where [Order]=@OrderORIGIN order by date desc`;
    let params = { OrderORIGIN: input["OrderORIGIN"] };
    console.log(queryS)
    let db = await mssqlR.qureyRParam(queryS, params);
    console.log(db)
    if (db['recordsets'].length > 0) {
      let datadb = db['recordsets'][0];
      output = datadb
    }
  }
  


  //-------------------------------------
  return res.json(date);
});

module.exports = router;


