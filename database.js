const sql = require('mssql');
const sqlConfig = require('./config').sqlConfig;

module.exports.sql = sql;
module.exports.sqlConfig = sqlConfig;
