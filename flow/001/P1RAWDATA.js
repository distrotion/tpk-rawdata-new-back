const express = require("express");
const router = express.Router();
var mssql = require('../../function/mssql');
var mongodb = require('../../function/mongodb');
var httpreq = require('../../function/axios');
var axios = require('axios');


router.get('/RAWDATA/version', async (req, res) => {
  // console.log(mssql.qurey())
  res.json("RAWDATA v0.1");
})

router.post('/RAWDATA/getplant', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/getplantt--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()


  //-------------------------------------
  return res.json(date);
});

router.post('/RAWDATA/getitems', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/getplantt--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()


  //-------------------------------------
  return res.json(date);
});

router.post('/RAWDATA/insertdata', async (req, res) => {
  //-------------------------------------
  console.log("--RAWDATA/getplantt--");
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let date = Date.now()


  //-------------------------------------
  return res.json(date);
});



module.exports = router;
