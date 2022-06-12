const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const deviceRoutes = require('./routes/device_routes');
const calenderRoutes = require('./routes/calender_routes');
const buildingRoutes = require('./routes/building_routes');
const roomRoutes = require('./routes/room_routes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: '*', allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'], allowHeaders: ['Content-Type', 'Accept'] }));
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
        res.status(400).send({ error: 'Bad request' });
    } else next();
});

app.use('/api/device', deviceRoutes);
app.use('/api/calender', calenderRoutes);
app.use('/api/building', buildingRoutes);
app.use('/api/room', roomRoutes);

module.exports = app;
