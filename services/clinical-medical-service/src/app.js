//app.js
const express  = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/doctors',       require('./src/routes/doctor.routes'));
app.use('/api/records',       require('./src/routes/record.routes'));
app.use('/api/prescriptions', require('./src/routes/prescription.routes'));
app.use('/api/ai',            require('./src/routes/ai.routes'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log('MongoDB error:', err));