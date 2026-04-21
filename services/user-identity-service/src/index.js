require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const routes = require('./routes');

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// All routes are mounted at /api so paths match what API Gateway forwards
app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'user-identity-service OK' }));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User Identity Service running on port ${PORT}`));
