const sql = require('mssql');
const sqlConfig = require('./config').sqlConfig;

module.exports.sql = sql; // Export SQL Module
module.exports.sqlConfig = sqlConfig; // Export SQL Config
