const database = require('./../database');

function addEvent(type, message) {
    if (!(type == 'success' || type == 'info' || type == 'error')) throw new Error('Invalid event type');

    database.sql.connect(database.sqlConfig).then((pool) => {
        pool.query("INSERT INTO [Terminator].[dbo].[events] (type, message, timestamp) VALUES ('" + type + "', '" + message + "', " + new Date().getTime() + ')');
    });
}

module.exports.addEvent = addEvent;
