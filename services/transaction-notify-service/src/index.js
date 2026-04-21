require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const routes = require('./routes');
const paymentCtrl = require('./controllers/paymentController');

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));

// Stripe webhook needs raw body — must be registered BEFORE express.json()
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentCtrl.handleWebhook
);

app.use(express.json());

app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'transaction-notify-service OK' }));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Transaction Notify Service running on port ${PORT}`));
