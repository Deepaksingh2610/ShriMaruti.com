require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const { processAndUploadImage } = require('../middleware/uploadMiddleware');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

async function runSanityCheck() {
  console.log('==================================================');
  console.log('🚀 RUNNING SYSTEM SANITY & HEALTH CHECK');
  console.log('==================================================\n');

  const report = {
    envVars: {},
    mongoDb: { status: 'UNKNOWN' },
    cloudinary: { status: 'UNKNOWN' },
    models: {},
    uploadPipeline: { status: 'UNKNOWN' }
  };

  // 1. Check Environment Variables
  console.log('1. Checking Essential Environment Variables...');
  const requiredEnv = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  let envOk = true;
  for (const key of requiredEnv) {
    const isSet = Boolean(process.env[key]);
    report.envVars[key] = isSet ? '✓ Set' : '✗ Missing';
    if (!isSet) envOk = false;
  }
  console.log('Environment Variables Status:', report.envVars);

  // 2. Test MongoDB Connection
  console.log('\n2. Testing MongoDB Connection...');
  try {
    const connStr = process.env.MONGODB_URI;
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    report.mongoDb = {
      status: 'SUCCESS',
      host: mongoose.connection.host,
      database: mongoose.connection.name
    };
    console.log(`✓ MongoDB Connected to: ${mongoose.connection.host} (${mongoose.connection.name})`);

    // 3. Count documents in collections
    console.log('\n3. Verifying Collection Documents & Schemas...');
    const userCount = await User.countDocuments();
    const prodCount = await Product.countDocuments();
    const catCount = await Category.countDocuments();
    const orderCount = await Order.countDocuments();

    report.models = {
      users: userCount,
      products: prodCount,
      categories: catCount,
      orders: orderCount
    };
    console.log(`✓ Users in DB: ${userCount}`);
    console.log(`✓ Products in DB: ${prodCount}`);
    console.log(`✓ Categories in DB: ${catCount}`);
    console.log(`✓ Orders in DB: ${orderCount}`);

  } catch (mongoErr) {
    report.mongoDb = { status: 'FAILED', error: mongoErr.message };
    console.error('✗ MongoDB Connection Error:', mongoErr.message);
  }

  // 4. Test Cloudinary Configuration
  console.log('\n4. Testing Cloudinary Configuration...');
  try {
    const config = cloudinary.config();
    if (config.cloud_name && config.api_key) {
      report.cloudinary = {
        status: 'CONFIG_VALID',
        cloudName: config.cloud_name
      };
      console.log(`✓ Cloudinary configured for cloud_name: ${config.cloud_name}`);
    } else {
      report.cloudinary = { status: 'CONFIG_MISSING_KEYS' };
      console.warn('✗ Cloudinary keys incomplete');
    }
  } catch (cloudErr) {
    report.cloudinary = { status: 'ERROR', error: cloudErr.message };
    console.error('✗ Cloudinary Check Failed:', cloudErr.message);
  }

  // 5. Test Sharp & Image Upload Pipeline with a generated 1x1 test buffer
  console.log('\n5. Testing Image Upload & Sharp Compression Pipeline...');
  try {
    const sharp = require('sharp');
    const testBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 140, b: 0, alpha: 1 }
      }
    }).png().toBuffer();

    const uploadRes = await processAndUploadImage(testBuffer, 'shrimaruti/sanity_test');
    if (uploadRes && uploadRes.url) {
      report.uploadPipeline = {
        status: 'SUCCESS',
        url: uploadRes.url,
        publicId: uploadRes.publicId || '(placeholder used or fallback)'
      };
      console.log(`✓ Image processing & upload succeeded. URL: ${uploadRes.url}`);
    } else {
      report.uploadPipeline = { status: 'FAILED', error: 'No URL returned' };
      console.error('✗ Upload returned empty result');
    }
  } catch (pipeErr) {
    report.uploadPipeline = { status: 'ERROR', error: pipeErr.message };
    console.error('✗ Upload Pipeline Error:', pipeErr.message);
  }

  // Close MongoDB Connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  console.log('\n==================================================');
  console.log('📊 FINAL SANITY CHECK REPORT:');
  console.log(JSON.stringify(report, null, 2));
  console.log('==================================================');
}

runSanityCheck().catch(err => {
  console.error('Fatal Script Error:', err);
  process.exit(1);
});
