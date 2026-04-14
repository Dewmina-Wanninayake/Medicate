/**
 * Run once to create the initial admin account.
 * Usage: node src/scripts/seed-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('[Seed] Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    firstName: 'Super',
    lastName:  'Admin',
    email:     process.env.ADMIN_EMAIL    || 'admin@medicateplatform.com',
    password:  process.env.ADMIN_PASSWORD || 'Admin@1234',
    role:      'admin',
    isActive:  true,
  });

  console.log('[Seed] Admin created successfully:', admin.email);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('[Seed] Error:', err.message);
  process.exit(1);
});