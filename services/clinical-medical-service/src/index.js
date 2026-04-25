require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const routes = require('./routes');

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded files statically
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const resolvedPath = path.resolve(uploadDir);
if (!fs.existsSync(resolvedPath)) {
  console.log(`[Init] Creating uploads directory at: ${resolvedPath}`);
  fs.mkdirSync(resolvedPath, { recursive: true });
} else {
  const files = fs.readdirSync(resolvedPath);
  console.log(`[Init] Uploads directory exists at: ${resolvedPath}. Contains ${files.length} files.`);
}

app.use('/uploads', express.static(resolvedPath));

app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'clinical-medical-service OK' }));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Clinical Medical Service running on port ${PORT}`));
