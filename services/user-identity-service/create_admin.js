const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const URI = process.env.MONGO_URI || 'mongodb://mongo-user:27017/user-identity-db';

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const User = require('./src/models/User');
  const existingAdmin = await User.findOne({ email: 'admin@medicate.com' });
  
  if (existingAdmin) {
    console.log('Admin already exists.');
    process.exit(0);
  }

  const admin = new User({
    name: 'Admin Medicate',
    email: 'admin@medicate.com',
    password: 'password123',
    role: 'admin',
    isVerified: true,
    isActive: true
  });

  await admin.save();
  console.log('Admin created successfully.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
