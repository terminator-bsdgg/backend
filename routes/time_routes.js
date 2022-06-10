const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.post('/data', body('amount').optional().isInt({ min: 1, max: 1000 }), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    return res.status(200).json({ data: [] });
});

module.exports = router;
