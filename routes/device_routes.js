const express = require('express');
const os = require('os');
const { body, validationResult } = require('express-validator');
const database = require('./../database');
const config = require('./../config');

const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.get('/informations', function (req, res) {
    res.status(200).send({
        version: config.version,
        arch: os.arch(),
        cpus: os.cpus(),
        freememory: os.freemem(),
        hostname: os.hostname(),
        loadavg: os.loadavg(),
        networkInterfaces: os.networkInterfaces(),
        platform: os.platform(),
        release: os.release(),
        totalmem: os.totalmem(),
        type: os.type(),
        uptime: os.uptime(),
    });
});

router.post('/logs', body('draw').optional().isNumeric(), body('type').optional().isString(), body('search').optional().isObject(), body('order').optional().isArray(), body('length').optional().isNumeric(), body('start').optional().isNumeric(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    database.sql.connect(database.sqlConfig).then((pool) => {
        pool.query('SELECT * FROM [Terminator].[dbo].[events] ORDER BY id DESC')
            .then((result) => {
                const logs = { draw: req.body['draw'] != undefined ? req.body['draw'] : 1, recordsTotal: result.recordset.length, recordsFiltered: 0, data: [] };

                if (req.body['search'] == undefined) {
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
                    switch (req.body['type']) {
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

                console.log('TODO!!! ' + req.body['order']);

                logs.recordsFiltered = logs.data.length;
                if (req.body['start'] != undefined) logs.data = logs.data.slice(req.body['start'], logs.data.length);
                if (req.body['length'] != undefined) logs.data = logs.data.splice(0, req.body['length']);

                return res.status(200).json(logs);
            })
            .catch((selectError) => {
                console.error(selectError);
                return res.status(400).json({ error: 'data_error_reading_logs' });
            });
    });
});

module.exports = router;
