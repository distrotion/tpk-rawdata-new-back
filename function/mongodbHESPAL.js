require('dotenv').config();
const { MongoClient } = require('mongodb');

// [FIX] CRITICAL: URL ย้ายมาจาก .env
// [FIX] PERF: Singleton pool — connect ครั้งเดียว ใช้ซ้ำทุก operation
const url = process.env.MONGODB_HESPAL_URL || 'mongodb://172.23.10.39:12022';
const client = new MongoClient(url, { maxPoolSize: 20, minPoolSize: 5 });
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
  return await c.db(db_input).collection(collection_input).insertMany(input);
};

exports.find = async (db_input, collection_input, input) => {
  const c = await getClient();
  return await c.db(db_input).collection(collection_input)
    .find(input).limit(1000).sort({ "_id": -1 }).toArray();
};

exports.findproject = async (db_input, collection_input, input1, input2) => {
  const c = await getClient();
  return await c.db(db_input).collection(collection_input)
    .find(input1).limit(500).sort({ "_id": -1 }).project(input2).toArray();
};

exports.findsome = async (db_input, collection_input, input) => {
  const c = await getClient();
  return await c.db(db_input).collection(collection_input)
    .find(input).limit(500).sort({ "_id": -1 })
    .project({ "PO": 1, "CP": 1, "ALL_DONE": 1 }).toArray();
};

exports.update = async (db_input, collection_input, input1, input2) => {
  const c = await getClient();
  return await c.db(db_input).collection(collection_input).updateOne(input1, input2);
};

exports.findSAP = async (urls, db_input, collection_input, input) => {
  const sapClient = new MongoClient(urls);
  await sapClient.connect();
  try {
    return await sapClient.db(db_input).collection(collection_input)
      .find(input).limit(1000).sort({ "_id": -1 }).toArray();
  } finally {
    await sapClient.close();
  }
};
