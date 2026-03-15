const axios = require('axios');
const http = require('http');
const https = require('https');

// ─────────────────────────────────────────────
// [PERF] Axios instance พร้อม connection pool
// เดิม: ทุก request เปิด TCP ใหม่ → +100-300 ms/req
// ใหม่: keepAlive reuse socket → ~0 ms TCP overhead
// ─────────────────────────────────────────────
const instance = axios.create({
  timeout: 10000, // [FIX] CRITICAL: กัน hang ไม่มีกำหนด (เดิม: ไม่มี timeout)
  httpAgent: new http.Agent({
    keepAlive: true,
    maxSockets: 50,
    keepAliveMsecs: 3000,
  }),
  httpsAgent: new https.Agent({
    keepAlive: true,
    maxSockets: 50,
    keepAliveMsecs: 3000,
  }),
});

// ─────────────────────────────────────────────
// [PERF] Retry helper — transient error (5xx / network)
// retry สูงสุด 2 ครั้ง พร้อม exponential backoff
// ─────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const withRetry = async (fn, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const status = err.response?.status;
      const isRetryable = !status || status >= 500; // network_error หรือ 5xx
      if (isRetryable && i < retries) {
        await sleep(200 * 2 ** i); // 200ms → 400ms
        continue;
      }
      throw err;
    }
  }
};

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────
exports.post = async (url, body) => {
  try {
    const res = await withRetry(() => instance.post(url, body));
    return res.data;
  } catch (error) {
    const status = error.response?.status ?? 'network_error';
    console.error('[axios.post] Error:', status, url);
    return status;
  }
};

exports.get = async (url) => {
  try {
    const res = await withRetry(() => instance.get(url));
    return res.data;
  } catch (error) {
    const status = error.response?.status ?? 'network_error';
    console.error('[axios.get] Error:', status, url);
    return status;
  }
};
