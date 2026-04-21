require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const routes = require('./routes');

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded files statically
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'clinical-medical-service OK' }));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Clinical Medical Service running on port ${PORT}`));
