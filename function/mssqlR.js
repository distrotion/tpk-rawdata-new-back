const sql = require('mssql');
const config = {
  user: "sa",
  password: "Automatic",
  database: "",
  server: '172.23.10.39',
  pool: {
    // max: 10,
    // min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  }
}

exports.qureyR = async (input) => {
  try {
    await sql.connect(config)
    let out =[];
    const result = await sql.query(input).then((v) => {
      // console.log(`---------------`);
      // console.log(v);  
      out = v;   
      // console.log(`---------------`);
      return v;
    
    }).then(() => sql.close())
  
    //  console.dir(result)
    return out;
  } catch (err) {
    return err;
  }
};


// .then((v) => console.log(v))
//     .then(() => sql.close())

