const express = require('express')
const app = express()
const cors = require("cors")
const router = express.Router();
const bodyParser = require('body-parser');
const port = 9781


// [FIX] PERF: ลด limit จาก 150mb → 10mb ป้องกัน memory exhaustion
// เดิม: bodyParser.urlencoded ถูก register 2 ครั้ง (ซ้ำซ้อน) + limit 150mb โหลดเข้า RAM ทั้งก้อน
// ถ้า payload จำเป็นต้องใช้ > 10mb ให้ใช้ multipart streaming แทน
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cors())
app.use("/", require("./api"))


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})

