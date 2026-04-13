/**
 * app.js — Express application factory
 * Wires up middleware, DB connection, and all route groups.
 */

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const mongoose   = require('mongoose');

// Route imports
const paymentRoutes      = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const webhookRoutes      = require('./routes/webhook.routes');

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

// ─── Stripe webhooks need raw body BEFORE JSON parser ─────────────────────────
// Mount raw-body routes first
app.use('/api/webhooks', webhookRoutes);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ─── MongoDB connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI ||
  'mongodb://localhost:27017/medicate-transactions';

mongoose.connect(MONGO_URI)
  .then(() => console.log('[DB] Connected to MongoDB'))
  .catch((err) => {
    console.error('[DB] Connection error:', err.message);
    process.exit(1);
  });

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    service: 'transaction-notify-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/payments',      paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.stack || err.message);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
