const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('./../database');
const tokenUtils = require('./../lib/tokenUtils');
const eventUtils = require('./../lib/eventUtils');

const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.post('/list', body('token').isString(), body('room_id').optional().isNumeric(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' });

        if (req.body['room_id'])
            database.sql.connect(database.sqlConfig).then((pool) => {
                pool.query(`SELECT * FROM [Terminator].[dbo].[calender] WHERE roomid = ${req.body['room_id']}`)
                    .then((result) => {
                        return res.status(200).json(result.recordset);
                    })
                    .catch((selectError) => {
                        eventUtils.addEvent('error', 'Error while reading Calender from database');
                        return res.status(400).json({ error: 'data_error_reading_calender' });
                    });
            });
        else
            database.sql.connect(database.sqlConfig).then((pool) => {
                pool.query(`SELECT * FROM [Terminator].[dbo].[calender]`)
                    .then((result) => {
                        return res.status(200).json(result.recordset);
                    })
                    .catch((selectError) => {
                        eventUtils.addEvent('error', 'Error while reading Calender from database');
                        return res.status(400).json({ error: 'data_error_reading_calender' });
                    });
            });
    });
});

module.exports = router;
