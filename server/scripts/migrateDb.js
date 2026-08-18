require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function syncDatabases() {
  console.log('🔄 SYNCING `test` DATABASE INTO `ganeshgifting` DATABASE...\n');
  
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000
  });
  const client = conn.connection.client;
  
  const testDb = client.db('test');
  const ganeshDb = client.db('ganeshgifting');

  const collections = await testDb.listCollections().toArray();

  for (const col of collections) {
    const colName = col.name;
    const testDocs = await testDb.collection(colName).find({}).toArray();
    
    try {
      await ganeshDb.collection(colName).drop();
    } catch (_e) {}

    if (testDocs.length > 0) {
      await ganeshDb.collection(colName).insertMany(testDocs);
    }
    console.log(`✓ Synchronized "${colName}": ${testDocs.length} documents copied to ganeshgifting DB.`);
  }

  console.log('\n✅ Sync complete! All active users & data are now in `ganeshgifting` DB.');
  await mongoose.disconnect();
}

syncDatabases().catch(err => {
  console.error('Sync Error:', err);
  process.exit(1);
});
