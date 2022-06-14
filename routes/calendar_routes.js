const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('./../database');
const tokenUtils = require('./../lib/tokenUtils');
const eventUtils = require('./../lib/eventUtils');

const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.post('/list', body('userid').optional().isString(), body('room_id').optional().isNumeric(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    database.sql.connect(database.sqlConfig).then((pool) => {
        const data = [];

        if (req.body['userid'] && req.body['room_id']) {
            pool.query('SELECT * FROM [Terminator].[dbo].[calendar] WHERE [userid] = @userid AND [room_id] = @room_id')
                .then((result) => {
                    result.recordset.forEach((row) => {
                        data.push({
                            id: row.id,
                            start: new Date(parseInt(row.startTime)).toISOString(),
                            end: new Date(parseInt(row.endTime)).toISOString(),
                            title: row.title,
                            classNames: ['cursor-pointer'],
                            extendedProps: {
                                organiser: row.organisator,
                                organisatorId: row.organisatorId,
                                start: row.startTime,
                                end: row.endTime,
                                roomid: row.roomid,
                                accepted: row.accepted,
                                declinedReason: row.declinedReason,
                            },
                        });
                    });

                    return res.status(200).json(data);
                })
                .catch((selectError) => {
                    eventUtils.addEvent('error', 'Error while selecting events', selectError);
                    return res.status(500).json({ error: 'Error while selecting from database' });
                });
        } else if (req.body['userid']) {
            pool.query('SELECT * FROM [Terminator].[dbo].[calendar] WHERE [userid] = @userid')
                .then((result) => {
                    result.recordset.forEach((row) => {
                        data.push({
                            id: row.id,
                            start: new Date(parseInt(row.startTime)).toISOString(),
                            end: new Date(parseInt(row.endTime)).toISOString(),
                            title: row.title,
                            classNames: ['cursor-pointer'],
                            extendedProps: {
                                organiser: row.organisator,
                                organisatorId: row.organisatorId,
                                start: row.startTime,
                                end: row.endTime,
                                roomid: row.roomid,
                                accepted: row.accepted,
                                declinedReason: row.declinedReason,
                            },
                        });
                    });

                    return res.status(200).json(data);
                })
                .catch((selectError) => {
                    eventUtils.addEvent('error', 'Error while selecting events', selectError);
                    return res.status(500).json({ error: 'Error while selecting from database' });
                });
        } else if (req.body['room_id']) {
            pool.query('SELECT * FROM [Terminator].[dbo].[calendar] WHERE [room_id] = @room_id')
                .then((result) => {
                    result.recordset.forEach((row) => {
                        data.push({
                            id: row.id,
                            start: new Date(parseInt(row.startTime)).toISOString(),
                            end: new Date(parseInt(row.endTime)).toISOString(),
                            title: row.title,
                            classNames: ['cursor-pointer'],
                            extendedProps: {
                                organiser: row.organisator,
                                organisatorId: row.organisatorId,
                                start: row.startTime,
                                end: row.endTime,
                                roomid: row.roomid,
                                accepted: row.accepted,
                                declinedReason: row.declinedReason,
                            },
                        });
                    });

                    return res.status(200).json(data);
                })
                .catch((selectError) => {
                    eventUtils.addEvent('error', 'Error while selecting events', selectError);
                    return res.status(500).json({ error: 'Error while selecting from database' });
                });
        } else {
            pool.query('SELECT * FROM [Terminator].[dbo].[calendar]')
                .then((result) => {
                    result.recordset.forEach((row) => {
                        data.push({
                            id: row.id,
                            start: new Date(parseInt(row.startTime)).toISOString(),
                            end: new Date(parseInt(row.endTime)).toISOString(),
                            title: row.title,
                            classNames: ['cursor-pointer'],
                            extendedProps: {
                                organiser: row.organisator,
                                organisatorId: row.organisatorId,
                                start: row.startTime,
                                end: row.endTime,
                                roomid: row.roomid,
                                accepted: row.accepted,
                                declinedReason: row.declinedReason,
                            },
                        });
                    });

                    return res.status(200).json(data);
                })
                .catch((selectError) => {
                    eventUtils.addEvent('error', 'Error while selecting events', selectError);
                    return res.status(500).json({ error: 'Error while selecting from database' });
                });
        }
    });
});

router.post('/list/pending', body('organisatorId').optional().isString(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    database.sql.connect(database.sqlConfig).then((pool) => {
        pool.query(req.body['organisatorId'] ? "SELECT * FROM [Terminator].[dbo].[calendar] WHERE [organisatorId] = '" + req.body['organisatorId'] + "' AND [accepted] = 0 AND [declinedReason] = ''" : "SELECT * FROM [Terminator].[dbo].[calendar] WHERE [accepted] = 0 AND [declinedReason] = ''")
            .then((result) => {
                return res.status(200).json(result.recordset);
            })
            .catch((selectError) => {
                console.log(selectError);
                eventUtils.addEvent('error', 'Error while selecting events', selectError);
                return res.status(500).json({ error: 'Error while selecting from database' });
            });
    });
});

router.post('/add', body('token').isString(), body('title').isString(), body('start').isInt(), body('end').isInt(), body('room_id').isNumeric(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' });

        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query(`SELECT * FROM [Terminator].[dbo].[calendar] WHERE roomid = ${req.body['room_id']} AND startTime = ${req.body['start']} AND endTime = ${req.body['end']}`)

                .then((result) => {
                    if (result.recordset.length > 0) {
                        return res.status(400).json({ error: 'data_error_calendar_already_exists' });
                    }

                    pool.query(`INSERT INTO [Terminator].[dbo].[calendar] (title, startTime, endTime, organisator, roomid) VALUES ('${req.body['title']}', ${req.body['start']}, ${req.body['end']}, '${user.clientInformations.username}', ${req.body['room_id']})`)
                        .then((insertResult) => {
                            eventUtils.addEvent('info', `${user.clientInformations.username} added a new event to the calendar`);
                            return res.status(200).json({ success: 'data_success_calendar_added' });
                        })
                        .catch((insertError) => {
                            eventUtils.addEvent('error', 'Error while adding Calendar to database');
                            return res.status(400).json({ error: 'data_error_adding_calendar' });
                        });
                })
                .catch((selectError) => {
                    eventUtils.addEvent('error', 'Error while reading Calendar from database');
                    return res.status(400).json({ error: 'data_error_reading_calendar' });
                });
        });
    });
});

router.post('/edit', body('token').isString(), body('accepted').isBoolean(), body('declinedReason').isString(), body('editor').isString(), (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    tokenUtils.isTokenValid(req.body['token']).then((user) => {
        if (!user.valid) return res.status(400).json({ error: 'Invalid token' });

        database.sql.connect(database.sqlConfig).then((pool) => {
            pool.query(`UPDATE [Terminator].[dbo].[calendar] SET accepted = ${req.body['accepted']}, declinedReason = '${req.body['declinedReason']}', editor = '${req.body['editor']}' WHERE id = ${req.body['id']}`)
                .then((result) => {
                    eventUtils.addEvent('info', `${user.clientInformations.username} edited an event in the calendar`);
                    return res.status(200).json({ success: 'data_success_calendar_edited' });
                })
                .catch((updateError) => {
                    eventUtils.addEvent('error', 'Error while updating Calendar in database');
                    return res.status(400).json({ error: 'data_error_updating_calendar' });
                });
        });
    });
});

module.exports = router;
