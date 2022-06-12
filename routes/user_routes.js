const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.post('/validate', body('token').isString(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (req.body['token'] == 'C4NQDvFIk8L#^@z!UKUnxXFcCZ5qlt')
        res.status(200).json({
            valid: true,
            clientInformations: {
                creationDate: Date.now(),
                username: 'Paul J.',
                email: 'pauul.win@gmail.com',
            },
        });
    else
        res.status(400).json({
            valid: false,
            clientInformations: {},
        });
});

module.exports = router;
