const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const database = require('./../database');
const tokenUtils = require('./../lib/tokenUtils');
const eventUtils = require('./../lib/eventUtils');

const router = express.Router();
const saltRounds = 10;

router.use((req, res, next) => {
    next();
});

router.post('/register', body('username').isLength({ min: 4 }).isString(), body('password').isLength({ min: 6 }).isString(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    bcrypt.hash(req.body['password'], saltRounds, function (hashError, hash) {
        if (hashError) {
            return res.status(400).json({ error: 'hash_error_ur' });
        }

        eventUtils.addEvent('info', 'New register attempt');

        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query("SELECT * FROM [HydroPoc].[dbo].[users] WHERE username = '" + req.body['username'] + "'")
                .then((result) => {
                    if (result.recordset.length > 0) {
                        return res.status(400).json({ error: 'register_user_already_exists' });
                    }

                    pool.query("INSERT INTO [HydroPoc].[dbo].[users] (username, password, lastlogin) VALUES ('" + req.body['username'] + "', '" + hash + "', 0)")
                        .then((result) => {
                            if (result.rowsAffected > 0) {
                                pool.query("SELECT * FROM [HydroPoc].[dbo].[users] WHERE username = '" + req.body['username'] + "'")
                                    .then((result) => {
                                        if (result.recordset.length > 0) {
                                            tokenUtils.createToken(result.recordset[0].id).then((token) => {
                                                return res.status(201).json({ success: 'user_created', token: token });
                                            });
                                        } else {
                                            return res.status(400).json({ error: 'register_user_invalid_length' });
                                        }
                                    })
                                    .catch((selectError) => {
                                        console.error(selectError);
                                        return res.status(400).json({ error: 'register_user_selet_error_after_register' });
                                    });
                            } else {
                                return res.status(400).json({ error: 'register_user_creation_no_rows_affected' });
                            }
                        })
                        .catch((insertError) => {
                            console.error(insertError);
                            return res.status(400).json({ error: 'register_user_insert_error' });
                        });
                })
                .catch((selectError) => {
                    console.error(selectError);
                    return res.status(400).json({ error: 'register_user_select_error' });
                });
        });
    });
});

router.post('/login', body('username').isString(), body('password').isString(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    eventUtils.addEvent('info', 'New login attempt');

    database.sql.connect(database.sqlConfig).then((pool) => {
        pool.query("SELECT * FROM [HydroPoc].[dbo].[users] WHERE username = '" + req.body['username'] + "'")
            .then((result) => {
                if (result.recordset.length == 0) {
                    return res.status(400).json({ error: 'register_user_not_exists' });
                }

                if (result.recordset.length > 1) {
                    return res.status(400).json({ error: 'register_user_too_many_exists' });
                }

                bcrypt.compare(req.body['password'], result.recordset[0].password, function (compareError, hashResult) {
                    if (compareError) {
                        return res.status(400).json({ error: 'compare_error_ur' });
                    }

                    if (hashResult)
                        tokenUtils.isTokenExisting(result.recordset[0].id).then((tokenExists) => {
                            if (tokenExists) tokenUtils.getToken(result.recordset[0].id).then((token) => res.status(200).json({ success: 'user_login', token: token }));
                            else tokenUtils.createToken(result.recordset[0].id).then((token) => res.status(200).json({ success: 'user_login', token: token }));
                        });
                    else return res.status(400).json({ error: 'invalid_user_credentials' });
                });
            })
            .catch((selectError) => {
                console.error(selectError);
                return res.status(400).json({ error: 'register_user_select_error' });
            });
    });
});

module.exports = router;
