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

router.get('/list', (req, res) => {
    // Register get route /api/building/list
    database.sql.connect(database.sqlConfig).then((pool) => {
        // Connect to database
        pool.query('SELECT * FROM [Terminator].[dbo].[buildings]')
            .then((result) => {
                // Collect data from mssql
                return res.status(200).json(result.recordset); // Return data
            })
            .catch((selectError) => {
                // If an error got thrown add it to the log and return error
                eventUtils.addEvent('error', 'Error while reading Buildings from database');
                return res.status(400).json({ error: 'data_error_reading_buildings' });
            });
    });
});

router.post('/add', body('token').isString(), body('name').isString(), body('description').isString(), (req, res) => {
    // Register post route /api/building/add
    const errors = validationResult(req); // Check if all fields are valid

    if (!errors.isEmpty()) {
        // If the request is invalid, return a error
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        // Get the user object by token
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' }); // If token is invalid return error

        database.sql.connect(database.sqlConfig).then((pool) => {
            // Connect to database
            pool.query(`INSERT INTO [Terminator].[dbo].[buildings] (name, description) VALUES ('${req.body['name']}', '${req.body['description']}')`)
                .then((resultInsert) => {
                    // Insert building into the database
                    // When added, add event to database and return success
                    eventUtils.addEvent('success', 'Building added by ' + user.username + ' with name ' + req.body['name']);
                    return res.status(200).json({ success: true });
                })
                .catch((insertError) => {
                    // If error happended post it to database and return error
                    eventUtils.addEvent('error', 'Error while adding building. This operation was started by user ' + user.clientInformations.username);
                    return res.status(400).json({ error: 'building_already_exists' });
                });
        });
    });
});

router.post('/delete', body('token').isString(), body('id').isNumeric(), (req, res) => {
    // Register post route /api/building/delete
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // If the request is invalid, return a error
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        // Get the user object by token
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' }); // If token is invalid return error

        database.sql.connect(database.sqlConfig).then((pool) => {
            // Connect to database

            // Delete calendar events, rooms and the building when the room is inside building
            pool.query(`DELETE FROM [Terminator].[dbo].[calendar] WHERE roomid = ${req.body['id']}`)
                .then((resultDelete) => {
                    pool.query(`DELETE FROM [Terminator].[dbo].[rooms] WHERE buildingid = ${req.body['id']}`)
                        .then((resultRooms) => {
                            pool.query(`DELETE FROM [Terminator].[dbo].[buildings] WHERE id = ${req.body['id']}`)
                                .then((result) => {
                                    if (result.rowsAffected > 0) {
                                        // Delete all objects
                                        // When success then return success and add to event
                                        eventUtils.addEvent('success', 'User ' + user.clientInformations.username + ' deleted building with id ' + req.body['id'] + ' and ' + resultRooms.rowsAffected + ' rooms');
                                        return res.status(200).json({ success: true });
                                    } else {
                                        // If error happened post it to database and return error
                                        eventUtils.addEvent('error', 'User ' + user.clientInformations.username + ' tried to delete building with id ' + req.body['id'] + ' but it does not exist');
                                        return res.status(400).json({ error: 'invalid_room_id' });
                                    }
                                })
                                .catch((deleteError) => {
                                    // If error happened post it to database and return error
                                    eventUtils.addEvent('error', 'Error while deleting Buildings from database');
                                    return res.status(400).json({ error: 'data_error_deleting_building' });
                                });
                        })
                        .catch((deleteErrorRooms) => {
                            // If error happened post it to database and return error
                            eventUtils.addEvent('error', 'Error while deleting rooms. This operation was started by user ' + user.clientInformations.username);
                            return res.status(400).json({ error: 'invalid_room_id_rooms' });
                        });
                })
                .catch((deleteError) => {
                    // If error happened post it to database and return error
                    eventUtils.addEvent('error', 'Error while deleting room. This operation was started by user ' + user.clientInformations.username);
                    return res.status(400).json({ error: 'invalid_room_id' });
                });
        });
    });
});

router.post('/edit', body('token').isString(), body('id').isNumeric(), body('name').isString(), body('description').isString(), (req, res) => {
    // Register post route /api/building/edit
    const errors = validationResult(req); // Check if all fields are valid

    if (!errors.isEmpty()) {
        // If the request is invalid, return a error
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        // Get the user object by token
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' }); // If token is invalid return error

        database.sql.connect(database.sqlConfig).then((pool) => {
            // Connect to database
            pool.query(`UPDATE [Terminator].[dbo].[buildings] SET name = '${req.body['name']}', description = '${req.body['description']}' WHERE id = ${req.body['id']}`)
                .then((result) => {
                    if (result.rowsAffected > 0) {
                        // Room got editet. Add event to database and return user success
                        eventUtils.addEvent('success', 'User ' + user.clientInformations.username + ' edited building with id ' + req.body['id']);
                        return res.status(200).json({ success: true });
                    } else {
                        // Check if a row got edit. If not add error to database and throw error to user
                        eventUtils.addEvent('error', 'User ' + user.clientInformations.username + ' tried to edit building with id ' + req.body['id'] + ' but it does not exist');
                        return res.status(400).json({ error: 'invalid_room_id' });
                    }
                })
                .catch((editError) => {
                    // If error happended post it to database and return error
                    eventUtils.addEvent('error', 'Error while editing Buildings from database');
                    return res.status(400).json({ error: 'data_error_editing_building' });
                });
        });
    });
});

module.exports = router;
