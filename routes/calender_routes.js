const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('./../database');
const tokenUtils = require('./../lib/tokenUtils');

const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.post('/test', body('token').isString(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    res.status(200).json([]);
});

module.exports = router;
