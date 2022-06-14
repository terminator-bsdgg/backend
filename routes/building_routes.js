const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('./../database');
const tokenUtils = require('./../lib/tokenUtils');
const eventUtils = require('./../lib/eventUtils');

const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.get('/list', (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    database.sql.connect(database.sqlConfig).then((pool) => {
        pool.query('SELECT * FROM [Terminator].[dbo].[buildings]')
            .then((result) => {
                return res.status(200).json(result.recordset);
            })
            .catch((selectError) => {
                eventUtils.addEvent('error', 'Error while reading Buildings from database');
                return res.status(400).json({ error: 'data_error_reading_buildings' });
            });
    });
});

router.post('/add', body('token').isString(), body('name').isString(), body('description').isString(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' });

        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query(`INSERT INTO [Terminator].[dbo].[buildings] (name, description) VALUES ('${req.body['name']}', '${req.body['description']}')`)
                .then((resultInsert) => {
                    eventUtils.addEvent('success', 'Building added by ' + user.username + ' with name ' + req.body['name']);
                    return res.status(200).json({ success: true });
                })
                .catch((insertError) => {
                    eventUtils.addEvent('error', 'Error while adding building. This operation was started by user ' + user.clientInformations.username);
                    return res.status(400).json({ error: 'building_already_exists' });
                });
        });
    });
});

router.post('/delete', body('token').isString(), body('id').isNumeric(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' });

        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query(`DELETE FROM [Terminator].[dbo].[calendar] WHERE roomid = ${req.body['id']}`)
                .then((resultDelete) => {
                    pool.query(`DELETE FROM [Terminator].[dbo].[rooms] WHERE buildingid = ${req.body['id']}`)
                        .then((resultRooms) => {
                            pool.query(`DELETE FROM [Terminator].[dbo].[buildings] WHERE id = ${req.body['id']}`)
                                .then((result) => {
                                    if (result.rowsAffected > 0) {
                                        eventUtils.addEvent('success', 'User ' + user.clientInformations.username + ' deleted building with id ' + req.body['id'] + ' and ' + resultRooms.rowsAffected + ' rooms');
                                        return res.status(200).json({ success: true });
                                    } else {
                                        eventUtils.addEvent('error', 'User ' + user.clientInformations.username + ' tried to delete building with id ' + req.body['id'] + ' but it does not exist');
                                        return res.status(400).json({ error: 'invalid_room_id' });
                                    }
                                })
                                .catch((deleteError) => {
                                    eventUtils.addEvent('error', 'Error while deleting Buildings from database');
                                    return res.status(400).json({ error: 'data_error_deleting_building' });
                                });
                        })
                        .catch((deleteErrorRooms) => {
                            eventUtils.addEvent('error', 'Error while deleting rooms. This operation was started by user ' + user.clientInformations.username);
                            return res.status(400).json({ error: 'invalid_room_id_rooms' });
                        });
                })
                .catch((deleteError) => {
                    eventUtils.addEvent('error', 'Error while deleting room. This operation was started by user ' + user.clientInformations.username);
                    return res.status(400).json({ error: 'invalid_room_id' });
                });
        });
    });
});

router.post('/edit', body('token').isString(), body('id').isNumeric(), body('name').isString(), body('description').isString(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' });

        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query(`UPDATE [Terminator].[dbo].[buildings] SET name = '${req.body['name']}', description = '${req.body['description']}' WHERE id = ${req.body['id']}`)
                .then((result) => {
                    if (result.rowsAffected > 0) {
                        eventUtils.addEvent('success', 'User ' + user.clientInformations.username + ' edited building with id ' + req.body['id']);
                        return res.status(200).json({ success: true });
                    } else {
                        eventUtils.addEvent('error', 'User ' + user.clientInformations.username + ' tried to edit building with id ' + req.body['id'] + ' but it does not exist');
                        return res.status(400).json({ error: 'invalid_room_id' });
                    }
                })
                .catch((editError) => {
                    eventUtils.addEvent('error', 'Error while editing Buildings from database');
                    return res.status(400).json({ error: 'data_error_editing_building' });
                });
        });
    });
});

module.exports = router;
