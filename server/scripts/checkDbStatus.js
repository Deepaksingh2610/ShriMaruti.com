require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectDb() {
  const uri = process.env.MONGODB_URI;
  console.log('URI in server/.env:', uri);
  
  const conn = await mongoose.connect(uri);
  console.log('Connected Host:', conn.connection.host);
  console.log('Default Connected DB Name:', conn.connection.name);

  // List all databases on this MongoDB Cluster
  const adminDb = conn.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log('\n--- All Databases on this MongoDB Cluster ---');
  for (const dbInfo of dbs.databases) {
    console.log(`Database: ${dbInfo.name} (${Math.round(dbInfo.sizeOnDisk / 1024)} KB)`);
    const dbInstance = conn.connection.client.db(dbInfo.name);
    const collections = await dbInstance.listCollections().toArray();
    for (const col of collections) {
      const count = await dbInstance.collection(col.name).countDocuments();
      console.log(`  └─ Collection: ${col.name} -> ${count} documents`);
    }
  }

  // Let's check users in currently connected DB
  const User = require('../models/User');
  const users = await User.find().select('name email role isEmailVerified createdAt');
  console.log('\n--- Users in current connected DB (' + conn.connection.name + ') ---');
  console.log(JSON.stringify(users, null, 2));

  // Also check adminController getAllUsers query logic
  const Order = require('../models/Order');
  console.log('\n--- Admin Users Query Check ---');
  const adminUsersQuery = await User.find({ role: 'user' })
    .select('name email phone photo addresses loyaltyPoints referralCode createdAt isEmailVerified')
    .sort({ createdAt: -1 });
  console.log(`Total users with role 'user': ${adminUsersQuery.length}`);
  console.log(JSON.stringify(adminUsersQuery, null, 2));

  await mongoose.disconnect();
}

inspectDb().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
