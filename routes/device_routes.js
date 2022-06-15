// Import modules
const express = require('express');
const os = require('os');
const { body, validationResult } = require('express-validator');
const database = require('./../database');
const config = require('./../config');

const router = express.Router(); // Create router for this route

router.use((req, res, next) => {
    next(); // Forward to request
});

router.get('/informations', function (req, res) {
    // Add get route /api/device/informations

    // Build json and return it with all informations from os module
    res.status(200).send({
        version: config.version,
        arch: os.arch(), // Returns a string identifying the kernel version.
        cpus: os.cpus(), // Returns the operating system name as returned by [`uname(3)`](https://linux.die.net/man/3/uname). For example, it returns `'Linux'` on Linux, `'Darwin'` on macOS, and `'Windows_NT'` on Windows.
        freememory: os.freemem(), // Returns the total amount of system memory in bytes as an integer.
        hostname: os.hostname(), // Returns an array containing the 1, 5, and 15 minute load averages.
        loadavg: os.loadavg(), // Returns the system uptime in number of seconds
        networkInterfaces: os.networkInterfaces(), // Returns an object containing network interfaces that have been assigned a network address.
        platform: os.platform(), // Returns the operating system's default directory for temporary files as a string.
        release: os.release(), // Returns an object containing network interfaces that have been assigned a network address.
        totalmem: os.totalmem(), // Returns an array of objects containing information about each logical CPU core.
        type: os.type(), // Returns the operating system as a string.
        uptime: os.uptime(), // Returns the amount of free system memory in bytes as an integer.
    });
});

router.post('/logs', body('draw').optional().isNumeric(), body('type').optional().isString(), body('search').optional().isObject(), body('order').optional().isArray(), body('length').optional().isNumeric(), body('start').optional().isNumeric(), (req, res) => {
    // Add post route /api/device/informations

    const errors = validationResult(req); // Check if all fields are valid

    if (!errors.isEmpty()) {
        // If the request is invalid, return a error
        return res.status(400).json({ errors: errors.array() });
    }

    database.sql.connect(database.sqlConfig).then((pool) => {
        // Connect to database
        pool.query('SELECT * FROM [Terminator].[dbo].[events] ORDER BY id DESC')
            .then((result) => {
                // Get all objects from events
                const logs = { draw: req.body['draw'] != undefined ? req.body['draw'] : 1, recordsTotal: result.recordset.length, recordsFiltered: 0, data: [] }; // Create sample object (This object structure is required by datatables)

                if (req.body['search'] == undefined) {
                    // Put all objects inside if no search query is given
                    result.recordset.forEach((log) => {
                        logs.data.push({
                            id: log.id,
                            timestamp: log.timestamp,
                            type: log.type,
                            message: log.message,
                        });
                    });
                } else {
                    result.recordset.forEach((log) => {
                        if (log.message.toLowerCase().includes(req.body['search']['value'].toString().toLowerCase())) {
                            // If search query is given loop through all objects and add if it contains search query
                            logs.data.push({
                                id: log.id,
                                timestamp: log.timestamp,
                                type: log.type,
                                message: log.message,
                            });
                        }
                    });
                }

                if (req.body['type'] != undefined) {
                    // Check if type is given
                    switch (
                        req.body['type'] // Filter object by type. If no type or invalid one is given return all.
                    ) {
                        case 'success':
                            logs.data = logs.data.filter((log) => log.type == 'success');
                            break;
                        case 'error':
                            logs.data = logs.data.filter((log) => log.type == 'error');
                            break;
                        case 'info':
                            logs.data = logs.data.filter((log) => log.type == 'info');
                            break;
                    }
                }

                logs.recordsFiltered = logs.data.length; // Count all Objects
                if (req.body['start'] != undefined) logs.data = logs.data.slice(req.body['start'], logs.data.length); // If start offset is given cut first N elements
                if (req.body['length'] != undefined) logs.data = logs.data.splice(0, req.body['length']); // Set the length of array to N elements

                return res.status(200).json(logs); // Return array to user
            })
            .catch((selectError) => {
                // If error was thrown, write it to console and return
                console.error(selectError);
                return res.status(400).json({ error: 'data_error_reading_logs' });
            });
    });
});

module.exports = router;
