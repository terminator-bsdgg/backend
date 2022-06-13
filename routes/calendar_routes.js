const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('./../database');
const eventUtils = require('./../lib/eventUtils');

const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.post('/list', body('room_id').optional().isNumeric(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    database.sql.connect(database.sqlConfig).then((pool) => {
        pool.query(req.body['room_id'] ? `SELECT * FROM [Terminator].[dbo].[calendar] WHERE roomid = ${req.body['room_id']}` : `SELECT * FROM [Terminator].[dbo].[calendar]`)
            .then((result) => {
                const data = [];

                result.recordset.forEach((row) => {
                    data.push({
                        id: row.id,
                        start: new Date(parseInt(row.startTime)).toISOString(),
                        end: new Date(parseInt(row.endTime)).toISOString(),
                        title: row.title,
                        classNames: [],
                        extendedProps: {
                            organisator: row.organisator,
                            start: row.startTime,
                            end: row.endTime,
                            roomid: row.roomid,
                        },
                    });
                });

                return res.status(200).json(data);
            })
            .catch((selectError) => {
                eventUtils.addEvent('error', 'Error while reading Calendar from database');
                return res.status(400).json({ error: 'data_error_reading_calendar' });
            });
    });
});

module.exports = router;
