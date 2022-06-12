const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('./../database');
const tokenUtils = require('./../lib/tokenUtils');

const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.post('/buildings', body('token').isString(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((result) => {
        if (!result.valid) return res.status(400).json({ error: 'Invalid token' });

        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query('SELECT * FROM [Terminator].[dbo].[buildings]')
                .then((result) => {
                    return res.status(200).json(result.recordset);
                })
                .catch((selectError) => {
                    return res.status(400).json({ error: 'data_error_reading_logs' });
                });
        });
    });
});

module.exports = router;
