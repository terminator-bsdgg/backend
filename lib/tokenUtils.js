const crypto = require('crypto');
const database = require('./../database');

function checkTokenByToken(token) {
    return new Promise((resolve) => {
        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query("SELECT * FROM [HydroPoc].[dbo].[tokens] WHERE token = '" + token + "'")
                .then((result) => {
                    if (result.recordset.length != 1) {
                        return resolve(false);
                    }

                    if (new Date().getTime() > result.recordset[0].validuntil) {
                        pool.query("DELETE FROM [HydroPoc].[dbo].[tokens] WHERE token = '" + token + "'");
                        return resolve(false);
                    }

                    return resolve(result.recordset[0].token == token);
                })
                .catch(() => {
                    return resolve(false);
                });
        });
    });
}

function isTokenExisting(userid) {
    return new Promise((resolve) => {
        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query('SELECT * FROM [HydroPoc].[dbo].[tokens] WHERE userid = ' + userid)
                .then((result) => {
                    if (result.recordset.length != 1) {
                        return resolve(false);
                    }

                    if (new Date().getTime() > result.recordset[0].validuntil) {
                        pool.query("DELETE FROM [HydroPoc].[dbo].[tokens] WHERE token = '" + token + "'");
                        return resolve(false);
                    }

                    return resolve(true);
                })
                .catch((error) => {
                    return resolve(false);
                });
        });
    });
}

function createToken(userid) {
    const expireDate = new Date();
    const token = crypto.randomBytes(20).toString('hex');
    expireDate.setDate(expireDate.getDate() + 7); // Add 7 days cooldown

    return new Promise((resolve) => {
        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query('INSERT INTO tokens (userid, token, validuntil) VALUES (' + userid + ", '" + token + "', " + expireDate.getTime() + ')')
                .then((result) => {
                    if (result.rowsAffected > 0) return resolve(token);

                    return resolve(false);
                })
                .catch((error) => {
                    return resolve(false);
                });
        });
    });
}

function getToken(userid) {
    return new Promise((resolve) => {
        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query('SELECT * FROM [HydroPoc].[dbo].[tokens] WHERE userid  = ' + userid)
                .then((result) => {
                    if (result.recordset.length != 1) {
                        return resolve(false);
                    }

                    return resolve(result.recordset[0].token);
                })
                .catch(() => {
                    return resolve(false);
                });
        });
    });
}

module.exports.checkTokenByToken = checkTokenByToken;
module.exports.isTokenExisting = isTokenExisting;
module.exports.createToken = createToken;
module.exports.getToken = getToken;
