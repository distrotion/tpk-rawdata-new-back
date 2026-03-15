require('dotenv').config();
const { MongoClient } = require('mongodb');

// [FIX] CRITICAL: URL ย้ายมาจาก .env แทนการ hardcode
const url = process.env.MONGODB_URL || 'mongodb://172.23.10.73:27017';

// [FIX] PERF: Singleton client — connect ครั้งเดียว ใช้ซ้ำทุก operation
// เดิม: สร้าง MongoClient ใหม่ทุก request → connection overhead สูงมาก
const client = new MongoClient(url);
let isConnected = false;

const getClient = async () => {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client;
};

exports.insertMany = async (db_input, collection_input, input) => {
  const c = await getClient();
  const collection = c.db(db_input).collection(collection_input);
  return await collection.insertMany(input);
};

exports.find = async (db_input, collection_input, input) => {
  const c = await getClient();
  const collection = c.db(db_input).collection(collection_input);
  return await collection.find(input).limit(1000).sort({ "_id": -1 }).toArray();
};

exports.findsome = async (db_input, collection_input, input) => {
  const c = await getClient();
  const collection = c.db(db_input).collection(collection_input);
  return await collection.find(input).limit(500).sort({ "_id": -1 })
    .project({ "PO": 1, "CP": 1, "ALL_DONE": 1 }).toArray();
};

exports.update = async (db_input, collection_input, input1, input2) => {
  const c = await getClient();
  const collection = c.db(db_input).collection(collection_input);
  return await collection.updateOne(input1, input2);
};

exports.findSAP = async (urls, db_input, collection_input, input) => {
  // [NOTE] findSAP ใช้ URL แยก จึงยังต้องสร้าง client ใหม่
  // แต่ถ้า URL เดิมซ้ำกัน ควรรวมเข้า singleton ด้วย
  const sapClient = new MongoClient(urls);
  await sapClient.connect();
  try {
    const collection = sapClient.db(db_input).collection(collection_input);
    return await collection.find(input).limit(1000).sort({ "_id": -1 }).toArray();
  } finally {
    await sapClient.close();
  }
};
