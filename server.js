const ora = require('ora');
const database = require('./database');
const app = require('./app');
const config = require('./config');
const eventUtils = require('./lib/eventUtils');

const gracefulShutdown = (msg) => {
    eventUtils.addEvent('error', 'Backend stopped with message: ' + msg); // Add event to database

    ora().info('Shutdown initiated: ' + msg);
    ora().info('Shutting down...');

    process.exit();
};

app.listen(config.port, () => {
    process.on('SIGTERM', gracefulShutdown); // Handle kill commands
    process.on('SIGINT', gracefulShutdown); // Handle interrupts
    process.on('uncaughtException', gracefulShutdown); // Prevent dirty exit on uncaught exceptions
    process.on('unhandledRejection', gracefulShutdown); // Prevent dirty exit on unhandled promise rejection

    database.sql.connect(config.sqlConfig, (error) => {
        // Connect to database with connection info given in config.json
        if (error) {
            ora().fail('Database connection error'); // Display error message
            return gracefulShutdown('Database connection error');
        }

        // Print success message
        ora().succeed('Database connected');
        ora().succeed('Backend started on port ' + config.port);
        eventUtils.addEvent('success', 'Backend started on port ' + config.port); // Add event to database
    });
}).on('error', (error) => {
    ora().fail('Backend failed to start (' + error.message + ')'); // Display error message
    process.exit(); // Close the program
});
