const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const doctorRoutes       = require('./routes/doctor.routes');
const recordRoutes       = require('./routes/record.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const aiRoutes           = require('./routes/ai.routes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'clinical-service' });
});

app.use('/api/doctors',       doctorRoutes);
app.use('/api/records',       recordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/ai',            aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Clinical service running on port ${PORT}`));