const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin:UGW8UDMPxwM3SHJV@cluster0.4eyusgd.mongodb.net/';

async function listAll() {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    const admin = conn.connection.db.admin();
    const dbs = await admin.listDatabases();
    
    for (const dbInfo of dbs.databases) {
        if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
        const db = conn.connection.useDb(dbInfo.name);
        const collections = await db.db.listCollections().toArray();
        
        for (const col of collections) {
            const count = await db.db.collection(col.name).countDocuments();
            console.log(`- DB: ${dbInfo.name}, Collection: ${col.name}, Count: ${count}`);
            
            if (col.name === 'users') {
                const users = await db.db.collection('users').find({}).toArray();
                users.forEach(u => {
                    console.log(`  User: ${u.email} (Role: ${u.role}, ID: ${u._id})`);
                });
            }
        }
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

listAll();
