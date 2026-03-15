require('dotenv').config();
const sql = require('mssql');

// [FIX] CRITICAL: credentials ย้ายมาจาก .env แทนการ hardcode
const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: "",
  server: process.env.MSSQL_SERVER,
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

// [FIX] PERF: Singleton pool — สร้างครั้งเดียว ใช้ซ้ำทุก query แทนการ connect/close ทุกครั้ง
let pool = null;

const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
};

exports.qurey = async (input) => {
  try {
    const db = await getPool();
    const result = await db.request().query(input);
    return result;
  } catch (err) {
    // [FIX] SECURITY: log error ฝั่ง server เท่านั้น ไม่ส่ง error object ออกไป
    console.error('[mssql] Query error:', err.message);
    return { error: 'Database query failed', recordset: [], recordsets: [[]] };
  }
};
