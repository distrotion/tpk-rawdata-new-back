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
  "BP12PAL": mongodbBP12PH,
  "BP12GAS": mongodbBP12GAS,
  "GWGAS":   mongodbGWGAS,
  "HESGAS":  mongodbHESGAS,
  "HESISN":  mongodbHESISN,
  "HESPAL":  mongodbHESPAL,
  "HESPH":   mongodbHESPH,
  "BP12KNG": mongodbBP12KNG,
  "BP12PVD": mongodbBP12PVD,
};


router.get('/RAWDATA2/version', async (req, res) => {
  // console.log(mssql.qurey())
  res.json("RAWDATA2 v0.2");
});

router.post('/RAWDATA2/Getinstrument', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA2/Getinstrument--");
  console.log(req.body);
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

router.post('/RAWDATA2/Getitemslist', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA2/Getitemslist--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  // let date = Date.now()
  let output = [];
  let buff01 = [];
  let ITEMMASTER = [];
  // [FIX] PERF: ใช้ plantModuleMap + Promise.all ทำ 2 queries พร้อมกัน
  // เดิม: 2 sequential await per plant → รอทีละ query
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



module.exports = router;


