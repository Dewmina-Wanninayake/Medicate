require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(morgan('dev'));

// Apply JWT auth middleware globally
app.use(authMiddleware);

const {
  USER_IDENTITY_SERVICE_URL,
  CLINICAL_MEDICAL_SERVICE_URL,
  APPOINTMENT_VIDEO_SERVICE_URL,
  TRANSACTION_NOTIFY_SERVICE_URL,
  AI_SYMPTOM_CHECKER_SERVICE_URL,
} = process.env;

const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error(`Proxy error to ${target}:`, err.message);
    res.status(502).json({ error: 'Service unavailable', target });
  },
});



// Route: /api/auth/** and /api/users/** → user-identity-service
app.use('/api/auth', createProxyMiddleware(proxyOptions(USER_IDENTITY_SERVICE_URL)));
app.use('/api/users', createProxyMiddleware(proxyOptions(USER_IDENTITY_SERVICE_URL)));
app.use('/api/admin', createProxyMiddleware(proxyOptions(USER_IDENTITY_SERVICE_URL)));

// Route: /api/doctors/** and /api/records/** → clinical-medical-service
app.use('/api/doctors', createProxyMiddleware(proxyOptions(CLINICAL_MEDICAL_SERVICE_URL)));
app.use('/api/records', createProxyMiddleware(proxyOptions(CLINICAL_MEDICAL_SERVICE_URL)));
app.use('/api/prescriptions', createProxyMiddleware(proxyOptions(CLINICAL_MEDICAL_SERVICE_URL)));

// Route: /api/appointments/** and /api/sessions/** → appointment-video-service
app.use('/api/appointments', createProxyMiddleware(proxyOptions(APPOINTMENT_VIDEO_SERVICE_URL)));
app.use('/api/sessions', createProxyMiddleware(proxyOptions(APPOINTMENT_VIDEO_SERVICE_URL)));

// Route: /api/payments/** and /api/notifications/** → transaction-notify-service
app.use('/api/payments', createProxyMiddleware(proxyOptions(TRANSACTION_NOTIFY_SERVICE_URL)));
app.use('/api/notifications', createProxyMiddleware(proxyOptions(TRANSACTION_NOTIFY_SERVICE_URL)));

// Route: /api/symptoms/** → ai-symptom-checker-service
app.use('/api/symptoms', createProxyMiddleware(proxyOptions(AI_SYMPTOM_CHECKER_SERVICE_URL)));

// Health check
app.get('/health', (req, res) => res.json({ status: 'API Gateway is running' }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
