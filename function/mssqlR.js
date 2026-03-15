require('dotenv').config();
const sql = require('mssql');

// [FIX] CRITICAL: credentials ย้ายมาจาก .env แทนการ hardcode
const config = {
  user: process.env.MSSQLR_USER,
  password: process.env.MSSQLR_PASSWORD,
  database: "",
  server: process.env.MSSQLR_SERVER,
  pool: {
    max: 10,  // [FIX] PERF: เปิด connection pool ป้องกัน connection exhaustion
    min: 2,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

// [FIX] PERF: Singleton pool — สร้างครั้งเดียว ใช้ซ้ำทุก query
let pool = null;

const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
};

// [FIX] PERF: ใช้ parameterized query (ป้องกัน SQL Injection ด้วย)
exports.qureyRParam = async (queryString, params) => {
  try {
    const db = await getPool();
    const request = db.request();
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
    const result = await request.query(queryString);
    return result;
  } catch (err) {
    // [FIX] SECURITY: log error ฝั่ง server เท่านั้น ไม่ส่ง error object ออกไป
    console.error('[mssqlR] qureyRParam error:', err.message);
    return { error: 'Database query failed', recordset: [], recordsets: [[]] };
  }
};

exports.qureyR = async (input) => {
  try {
    const db = await getPool();
    const result = await db.request().query(input);
    return result;
  } catch (err) {
    console.error('[mssqlR] qureyR error:', err.message);
    return { error: 'Database query failed', recordset: [], recordsets: [[]] };
  }
};
