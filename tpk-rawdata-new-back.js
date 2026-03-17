const express = require('express')
const app = express()
const cors = require("cors")
const bodyParser = require('body-parser');
const port = 9781

// [FIX] CRITICAL: CORS ต้องอยู่ก่อน middleware อื่นทั้งหมด
// เดิม: cors() อยู่หลัง bodyParser → preflight OPTIONS ถูก reject ก่อนถึง cors
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // IE11 ต้องการ 200 ไม่ใช่ 204
};

app.use(cors(corsOptions));

// [FIX] CRITICAL: ตอบ preflight OPTIONS ทุก route โดยอัตโนมัติ
app.options('*', cors(corsOptions));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use("/", require("./api"))

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
})
