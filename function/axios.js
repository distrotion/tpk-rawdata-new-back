const axios = require('axios');

// [FIX] PERF: ใช้ async/await โดยตรงแทน .then()/.catch() wrapper ที่ซ้ำซ้อน
// เดิม: await promise แล้วยัง .then() ซ้ำอีก + ใช้ตัวแปร output เป็น intermediate
// ใหม่: return โดยตรง — ไม่มี overhead จาก Promise wrapper ที่ไม่จำเป็น

exports.post = async (url, body) => {
  try {
    const res = await axios.post(url, body);
    return res.data;
  } catch (error) {
    const status = error.response?.status ?? 'network_error';
    console.error('[axios.post] Error:', status, url);
    return status;
  }
};

exports.get = async (url) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    const status = error.response?.status ?? 'network_error';
    console.error('[axios.get] Error:', status, url);
    return status;
  }
};
