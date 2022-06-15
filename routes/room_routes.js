// Import modules
const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('./../database');
const tokenUtils = require('./../lib/tokenUtils');
const eventUtils = require('./../lib/eventUtils');

const router = express.Router(); // Create router for this route

router.use((req, res, next) => {
    next(); // Forward to request
});

router.post('/list', body('building_id').optional().isNumeric(), (req, res) => {
    const errors = validationResult(req); // Check if all fields are valid

    if (!errors.isEmpty()) {
        // If the request is invalid, return a error
        return res.status(400).json({ errors: errors.array() });
    }

    database.sql.connect(database.sqlConfig).then((pool) => {
        // Connect to database
        if (req.body['building']) {
            // Check if building property exists in body
            pool.query(`SELECT * FROM [Terminator].[dbo].[rooms] WHERE buildingid = ${req.body['building_id']}`)
                .then((result) => {
                    // Get all elements where buildingid is same as given
                    return res.status(200).json(result.recordset); // Return array
                })
                .catch((selectError) => {
                    // Add error if thrown to database and return error to user
                    eventUtils.addEvent('error', 'Error while reading Rooms from database');
                    return res.status(400).json({ error: 'data_error_reading_rooms' });
                });
        } else {
            pool.query('SELECT * FROM [Terminator].[dbo].[rooms]')
                .then((result) => {
                    return res.status(200).json(result.recordset); // Return all objects as array back to user
                })
                .catch((selectError) => {
                    // Add error if thrown to database and return error to user
                    eventUtils.addEvent('error', 'Error while reading Rooms from database');
                    return res.status(400).json({ error: 'data_error_reading_rooms' });
                });
        }
    });
});

router.post('/add', body('token').isString(), body('building_id').isNumeric(), body('name').isString(), body('description').isString(), (req, res) => {
    const errors = validationResult(req); // Check if all fields are valid

    if (!errors.isEmpty()) {
        // If the request is invalid, return a error
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        // Get the user object by token
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' }); // If token is invalid return error

        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query(`SELECT * FROM [Terminator].[dbo].[buildings] WHERE id = ${req.body['building_id']}`)
                .then((result) => {
                    if (result.rowsAffected <= 0) return res.status(400).json({ error: 'invalid_building_id' });

                    pool.query(`INSERT INTO [Terminator].[dbo].[rooms] (name, description, buildingid) VALUES ('${req.body['name']}', '${req.body['description']}', ${req.body['building_id']})`)
                        .then((resultInsert) => {
                            eventUtils.addEvent('success', 'User ' + user.clientInformations.username + ' added room with id ' + resultInsert.insertId + ' to building with id ' + req.body['building_id']);
                            return res.status(200).json({ success: true });
                        })
                        .catch((insertError) => {
                            // Add error if thrown to database and return error to user
                            eventUtils.addEvent('error', 'Error while adding room. This operation was started by user ' + user.clientInformations.username);
                            return res.status(400).json({ error: 'room_already_exists' });
                        });
                })
                .catch((selectError) => {
                    // Add error if thrown to database and return error to user
                    eventUtils.addEvent('error', 'Error while adding room. This operation was started by user ' + user.clientInformations.username);
                    return res.status(400).json({ error: 'invalid_room_id_rooms' });
                });
        });
    });
});

router.post('/delete', body('token').isString(), body('id').isNumeric(), (req, res) => {
    const errors = validationResult(req); // Check if all fields are valid

    if (!errors.isEmpty()) {
        // If the request is invalid, return a error
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        // Get the user object by token
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' }); // If token is invalid return error

        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query(`SELECT * FROM [Terminator].[dbo].[rooms] WHERE id = ${req.body['id']}`)
                .then((result) => {
                    if (result.rowsAffected <= 0) return res.status(400).json({ error: 'invalid_room_id' });

                    pool.query(`DELETE FROM [Terminator].[dbo].[calendar] WHERE roomid = ${req.body['id']}`)
                        .then((resultDelete) => {
                            pool.query(`DELETE FROM [Terminator].[dbo].[rooms] WHERE id = ${req.body['id']}`)
                                .then((resultDelete) => {
                                    eventUtils.addEvent('success', 'User ' + user.clientInformations.username + ' deleted room with id ' + req.body['id']);
                                    return res.status(200).json({ success: true });
                                })
                                .catch((deleteError) => {
                                    // Add error if thrown to database and return error to user
                                    eventUtils.addEvent('error', 'Error while deleting room. This operation was started by user ' + user.clientInformations.username);
                                    return res.status(400).json({ error: 'invalid_room_id' });
                                });
                        })
                        .catch((deleteError) => {
                            // Add error if thrown to database and return error to user
                            eventUtils.addEvent('error', 'Error while deleting room. This operation was started by user ' + user.clientInformations.username);
                            return res.status(400).json({ error: 'invalid_room_id' });
                        });
                })
                .catch((selectError) => {
                    // Add error if thrown to database and return error to user
                    eventUtils.addEvent('error', 'Error while deleting room. This operation was started by user ' + user.clientInformations.username);
                    return res.status(400).json({ error: 'invalid_room_id' });
                });
        });
    });
});

router.post('/edit', body('token').isString(), body('id').isNumeric(), body('name').isString(), body('description').isString(), (req, res) => {
    const errors = validationResult(req); // Check if all fields are valid

    if (!errors.isEmpty()) {
        // If the request is invalid, return a error
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        // Get the user object by token
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' }); // If token is invalid return error

        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query(`SELECT * FROM [Terminator].[dbo].[rooms] WHERE id = ${req.body['id']}`)
                .then((result) => {
                    if (result.rowsAffected <= 0) return res.status(400).json({ error: 'invalid_room_id' });

                    pool.query(`UPDATE [Terminator].[dbo].[rooms] SET name = '${req.body['name']}', description = '${req.body['description']}' WHERE id = ${req.body['id']}`)
                        .then((resultUpdate) => {
                            eventUtils.addEvent('success', 'User ' + user.clientInformations.username + ' updated room with id ' + req.body['id']);
                            return res.status(200).json({ success: true });
                        })
                        .catch((updateError) => {
                            // Add error if thrown to database and return error to user
                            eventUtils.addEvent('error', 'Error while updating room. This operation was started by user ' + user.clientInformations.username);
                            return res.status(400).json({ error: 'name_already_exists' });
                        });
                })
                .catch((selectError) => {
                    // Add error if thrown to database and return error to user
                    eventUtils.addEvent('error', 'Error while selecting updating room. This operation was started by user ' + user.clientInformations.username);
                    return res.status(400).json({ error: 'invalid_room_id_select' });
                });
        });
    });
});

module.exports = router;
