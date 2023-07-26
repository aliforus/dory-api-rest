const mysql = require('mysql2');
const config = require('../config');
const helper = require('../helper');
const pool= mysql.createPool(config.db);
const promisePool = pool.promise();

async function query(sql, params) {
  if(helper.isProductionEnv()){
    const [results, ] = await promisePool.execute(sql, params);
    return results;
  }else{
    const [results, ] = await promisePool.query(sql, params);
    return results;
  }
}

async function newConnection(){
 // const connection = await mysql.createConnection(config.db);return connection;
  return promisePool.getConnection();
}

module.exports = {
  query,
  newConnection
}