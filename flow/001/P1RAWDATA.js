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

var httpreq = require('../../function/axios');
var axios = require('axios');


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
  if (input['PLANT'] != undefined) {
    if (input['PLANT'] === "BP12PH") {
      let findDB = await mongodbBP12PH.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }else if (input['PLANT'] === "BP12GAS") {
      let findDB = await mongodbBP12GAS.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }else if (input['PLANT'] === "GWGAS") {
      let findDB = await mongodbGWGAS.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }else if (input['PLANT'] === "HESGAS") {
      let findDB = await mongodbHESGAS.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }else if (input['PLANT'] === "HESISN") {
      let findDB = await mongodbHESISN.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
      console.log(output);
    }else  if (input['PLANT'] === "HESPAL") {
      let findDB = await mongodbHESPAL.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }else  if (input['PLANT'] === "HESPH") {
      let findDB = await mongodbHESPH.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }

  }


  //-------------------------------------
  return res.json(output);
});

router.post('/RAWDATA/Getitems', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/Getitems--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  // let date = Date.now()
  let output = [];
  if (input['PLANT'] != undefined) {
    if (input['PLANT'] = "BP12PH") {
      let findDB = await mongodbBP12PH.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }
    if (input['PLANT'] === "BP12GAS") {
      let findDB = await mongodbBP12GAS.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }
    if (input['PLANT'] === "GWGAS") {
      let findDB = await mongodbGWGAS.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }
    if (input['PLANT'] === "HESGAS") {
      let findDB = await mongodbHESGAS.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }
    if (input['PLANT'] === "HESISN") {
      let findDB = await mongodbHESISN.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }
    if (input['PLANT'] === "HESPAL") {
      let findDB = await mongodbHESPAL.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }
    if (input['PLANT'] === "HESPH") {
      let findDB = await mongodbHESPH.find("master_FN", "INSTRUMENTS", {});
      output = findDB;
    }

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
  if (input['PLANT'] != undefined && input['CP'] != undefined && input['PCDATA'] != undefined&& input['PCDATAL'] != undefined) {
    if (input['PLANT'] = "BP12PH") {
      let findDB = await mongodbBP12PH.find("PATTERN", "PATTERN_01", {"CP":`${input['CP']}`});
      buff01 = findDB;
      let findDB2 = await mongodbBP12PH.find(`${input['PCDATA']}`, "ITEMs", {});
      ITEMMASTER = findDB2;
    }
    if (input['PLANT'] = "BP12GAS") {
      let findDB = await mongodbBP12GAS.find("PATTERN", "PATTERN_01", {"CP":`${input['CP']}`});
      buff01 = findDB;
      let findDB2 = await mongodbBP12GAS.find(`${input['PCDATA']}`, "ITEMs", {});
      ITEMMASTER = findDB2;
    }
    if (input['PLANT'] = "GWGAS") {
      let findDB = await mongodbGWGAS.find("PATTERN", "PATTERN_01",  {"CP":`${input['CP']}`});
      buff01 = findDB;
      let findDB2 = await mongodbGWGAS.find(`${input['PCDATA']}`, "ITEMs", {});
      ITEMMASTER = findDB2;
    }
    if (input['PLANT'] = "HESGAS") {
      let findDB = await mongodbHESGAS.find("PATTERN", "PATTERN_01",  {"CP":`${input['CP']}`});
      buff01 = findDB;
      let findDB2 = await mongodbHESGAS.find(`${input['PCDATA']}`, "ITEMs", {});
      ITEMMASTER = findDB2;
    }
    if (input['PLANT'] = "HESISN") {
      let findDB = await mongodbHESISN.find("PATTERN", "PATTERN_01",  {"CP":`${input['CP']}`});
      buff01 = findDB;
      let findDB2 = await mongodbHESISN.find(`${input['PCDATA']}`, "ITEMs", {});
      ITEMMASTER = findDB2;
    }
    if (input['PLANT'] = "HESPAL") {
      let findDB = await mongodbHESPAL.find("PATTERN", "PATTERN_01",  {"CP":`${input['CP']}`});
      buff01 = findDB;
      let findDB2 = await mongodbHESPAL.find(`${input['PCDATA']}`, "ITEMs", {});
      ITEMMASTER = findDB2;
    }
    if (input['PLANT'] = "HESPH") {
      let findDB = await mongodbHESPH.find("PATTERN", "PATTERN_01",  {"CP":`${input['CP']}`});
      buff01 = findDB;
      let findDB2 = await mongodbHESPH.find(`${input['PCDATA']}`, "ITEMs", {});
      ITEMMASTER = findDB2;
    }

    if(buff01.length>0){
      if(buff01[0][`${input['PCDATAL']}`] != undefined){

        let indata = buff01[0][`${input['PCDATAL']}`];

        for (let i = 0; i < indata.length; i++) {
          output.push({"Items": indata[i]['ITEMs']})
          
        }

        for (let j = 0; j < output.length; j++) {
          for (let k = 0; k < ITEMMASTER.length; k++) {
            if(ITEMMASTER[k]['masterID'] === output[j]['Items']){
              output[j]['ItemsName']= ITEMMASTER[k]['ITEMs']
              break;
            }
            
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
    ([Location],[Plant],[Order],[CP],[FG],[ItemsCode],[ItemsName],[NUMBER],[POINT],[Data],[Picture],[UserInput] ,[SEQ],[QTYT],[UNIT],[CUSTNA],[PARTNA],[PARTNO],[PROC],[CUSLOTNO],[FG_CHARG],[CUST_FULLNM],[TYPE],[SP01],[SP02]) 
    VALUES ('${input["Location"]}','${input["Plant"]}','${input["Order"]}','${input["CP"]}','${input["FG"]}','${input["ItemsCode"]}','${input["ItemsName"]}','${input["NUMBER"]}','${input["POINT"]}','${input["Data"]}','${input["Picture"]}','${input["UserInput"]}','${input["SEQ"]}','${input["QTYT"]}','${input["UNIT"]}','${input["CUSTNA"]}','${input["PARTNA"]}','${input["PARTNO"]}','${input["PROC"]}','${input["CUSLOTNO"]}','${input["FG_CHARG"]}','${input["CUST_FULLNM"]}','${input["TYPE"]}','${input["INSTRUMENT"]}','${input["SP02"]}');`;

    console.log(queryS)
    let db = await mssqlR.qureyR(queryS);
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
    let queryS = `SELECT *  FROM [RAWDATA].[dbo].[autorawdata] where [Order]='${input["Order"]}' AND [NUMBER]='${input["NUMBER"]}' AND [TYPE]='${input["TYPE"]}' order by date desc`;

    console.log(queryS)
    let db = await mssqlR.qureyR(queryS);
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
    let queryS = `SELECT *  FROM [RAWDATA].[dbo].[autorawdata] where [Order]='${input["Order"]}' AND [TYPE]='${input["TYPE"]}' order by date desc`;

    console.log(queryS)
    let db = await mssqlR.qureyR(queryS);
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
    let queryS = `SELECT *  FROM [RAWDATA].[dbo].[autorawdata] where [Order]= '${input["Order"]}' order by date desc`;

    console.log(queryS)
    let db = await mssqlR.qureyR(queryS);
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
    // let queryS = `delete from [RAWDATA].[dbo].[autorawdata] where [Order]= '${input["Order"]}' order by date desc limit 1`;
    let queryS = `DELETE FROM [RAWDATA].[dbo].[autorawdata]
                  WHERE [date] IN (
                      SELECT TOP 1 [date] 
                      FROM [RAWDATA].[dbo].[autorawdata]
                      WHERE [Order] = '${input["Order"]}'
                      ORDER BY [date] DESC
                  );`;

    console.log(queryS)
    let db = await mssqlR.qureyR(queryS);
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

module.exports = router;


