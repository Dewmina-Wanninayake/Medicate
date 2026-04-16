//app.js
const express  = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/doctors',       require('./routes/doctor.routes'));
app.use('/api/records',       require('./routes/record.routes'));
app.use('/api/prescriptions', require('./routes/prescription.routes'));
app.use('/api/ai',            require('./routes/ai.routes'));

module.exports = app;