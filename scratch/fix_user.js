const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_HOST = 'localhost:27017';
const USER_DB = `mongodb://${MONGO_HOST}/medicate_users`;

async function fixUser() {
  try {
    console.log('--- FIXING USER PASSWORD ---');
    
    const userConn = await mongoose.createConnection(USER_DB).asPromise();
    
    const userSchema = new mongoose.Schema({
      email: { type: String, unique: true },
      password: { type: String, required: true }
    }, { timestamps: true, collection: 'users' });

    // IMPORTANT: No pre-save hook here because we want to set it directly 
    // to a SINGLE-hashed value, or we use the plain text if we had the hook.
    // For safety and speed, I will generate the correct hash here and 
    // use a direct MongoDB update to bypass any model hooks.

    const User = userConn.model('User', userSchema);

    const email = 'dulajtck@gmail.com';
    const plainPassword = '123456789D';
    const singleHash = await bcrypt.hash(plainPassword, 12);

    const result = await userConn.db.collection('users').updateOne(
      { email },
      { $set: { password: singleHash } }
    );

    if (result.matchedCount > 0) {
      console.log(`[Success] Updated password for ${email}`);
    } else {
      console.error(`[Error] User ${email} not found!`);
    }

    await userConn.close();
    console.log('--- FIX COMPLETE ---');

  } catch (err) {
    console.error('[Error] Fix failed:', err);
  } finally {
    process.exit(0);
  }
}

fixUser();
