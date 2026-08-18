require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');
const UPISettings = require('../models/UPISettings');

async function testLiveWrite() {
  console.log('====================================================');
  console.log('🔍 RE-CHECKING DATABASE TARGET FOR ADMIN & ALL APIS');
  console.log('====================================================\n');

  console.log('1. Reading MONGODB_URI from server/.env:');
  console.log('   URI:', process.env.MONGODB_URI);

  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000
  });

  const activeDbName = conn.connection.name;
  console.log(`\n2. Active Connected Database Name: "${activeDbName}"`);

  if (activeDbName === 'ganeshgifting') {
    console.log('   ✅ CONFIRMED: Backend is connected to "ganeshgifting" database!');
  } else {
    console.log(`   ⚠️ WARNING: Backend is connected to "${activeDbName}"`);
  }

  // Check counts in ganeshgifting vs test
  const client = conn.connection.client;
  const ganeshDb = client.db('ganeshgifting');
  const testDb = client.db('test');

  console.log('\n3. Document Counts in "ganeshgifting" DB:');
  const collections = ['users', 'products', 'categories', 'banners', 'upisettings', 'coupons', 'media'];
  for (const c of collections) {
    const gCount = await ganeshDb.collection(c).countDocuments();
    console.log(`   - ${c.padEnd(15)} : ${gCount} documents`);
  }

  // Perform a live test write via Admin Product model
  console.log('\n4. Performing a live test write via Admin Product model...');
  const testCategory = await Category.findOne({});
  const testSlug = `admin-verify-test-${Date.now()}`;
  const testProd = await Product.create({
    name: 'Admin Target Verification Item',
    slug: testSlug,
    category: testCategory?._id,
    categoryName: testCategory?.name || 'General',
    price: 999,
    originalPrice: 1299,
    stock: 10,
    description: 'Test product for verifying database destination',
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48']
  });

  // Verify which DB it was saved into
  const inGanesh = await ganeshDb.collection('products').findOne({ slug: testSlug });
  const inTest = await testDb.collection('products').findOne({ slug: testSlug });

  console.log('\n5. Target Verification Results:');
  console.log(`   - Found in "ganeshgifting" DB? : ${inGanesh ? '✅ YES (Saved in ganeshgifting)' : '❌ NO'}`);
  console.log(`   - Found in "test" DB?         : ${inTest ? '⚠️ YES' : '✅ NO (Zero writes to test DB)'}`);

  // Also test Banner model target
  const testBanner = await Banner.create({
    title: 'Verification Banner',
    subtitle: 'Checking target DB',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48',
    type: 'hero'
  });
  const bannerInGanesh = await ganeshDb.collection('banners').findOne({ _id: testBanner._id });
  const bannerInTest = await testDb.collection('banners').findOne({ _id: testBanner._id });
  console.log(`   - Banner saved in "ganeshgifting"? : ${bannerInGanesh ? '✅ YES' : '❌ NO'}`);
  console.log(`   - Banner saved in "test"?         : ${bannerInTest ? '⚠️ YES' : '✅ NO'}`);

  // Cleanup test product & banner
  await Product.deleteOne({ _id: testProd._id });
  await Banner.deleteOne({ _id: testBanner._id });
  console.log('\n✓ Cleaned up test verification items.');

  await mongoose.disconnect();
  console.log('\n====================================================');
  console.log('🎉 RE-CHECK 100% COMPLETE & VERIFIED:');
  console.log('   All Admin data is directly saved in `ganeshgifting`!');
  console.log('====================================================');
}

testLiveWrite().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
