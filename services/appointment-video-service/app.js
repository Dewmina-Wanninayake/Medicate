require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketHandler');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Appointment & Consultation Microservice (Refactored) is running' });
});

// Import Routers
const appointmentRoutes = require('./routers/appointmentRoutes');
const consultationRoutes = require('./routers/consultationRoutes');

app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initSocket(io);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const startServer = async () => {
  await connectDB();
  require('./config/redis');

  const PORT = process.env.PORT || 5003;
  server.listen(PORT, () => {
    console.log(`Appointment Service running on port ${PORT}`);
  });
};

startServer();
