const database = require('./../database'); // Require database

function addEvent(type, message) {
    // Create function
    if (!(type == 'success' || type == 'info' || type == 'error')) throw new Error('Invalid event type'); // Check if type is success, info or error. If none of these types was given, throw invalid event type exception

    database.sql.connect(database.sqlConfig).then((pool) => {
        // Connect to database
        pool.query("INSERT INTO [Terminator].[dbo].[events] (type, message, timestamp) VALUES ('" + type + "', '" + message + "', " + new Date().getTime() + ')'); // Add event to database
    });
}

module.exports.addEvent = addEvent; // Export function
