const express = require('express');
const os = require('os');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.post('/data', body('draw').optional().isNumeric(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    console.log('Test');
    return res.status(200).json([]);
});

module.exports = router;
