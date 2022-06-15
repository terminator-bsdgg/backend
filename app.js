const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express(); // Create Express Server

const deviceRoutes = require('./routes/device_routes'); // Load device routes into variable deviceRoutes
const calendarRoutes = require('./routes/calendar_routes'); // Load calendar routes into variable calendarRoutes
const buildingRoutes = require('./routes/building_routes'); // Load building routes into variable buildingRoutes
const roomRoutes = require('./routes/room_routes'); // Load room routes into variable roomRoutes

app.use(bodyParser.urlencoded({ extended: true })); // Mandatory when using JSON to enable extended urlencode
app.use(bodyParser.json()); // Enable JSON for get / post requests
// In Production please change origin because it could be unsafe.
app.use(cors({ origin: '*', allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'], allowHeaders: ['Content-Type', 'Accept'] })); // Enable cors to enable get / post requests.
app.use((error, req, res, next) => {
    // Used for error catching when invalid json syntax on requests is given
    if (error instanceof SyntaxError) {
        // Check if Syntax error
        res.status(400).send({ error: 'Bad request' }); // Return Bad request
    } else next(); // Forward to request
});

// Register routes for usage
app.use('/api/device', deviceRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/building', buildingRoutes);
app.use('/api/room', roomRoutes);

module.exports = app; // Export finish server module
