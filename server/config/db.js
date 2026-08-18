const mongoose = require('mongoose');

const ensureAdminUser = async () => {
  try {
    const User = require('../models/User');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ganeshgifting.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      await User.create({
        name: 'Anuj Singh Admin',
        email: adminEmail,
        phone: '9876543210',
        password: adminPassword,
        role: 'admin',
        referralCode: 'ADMINREF100',
        loyaltyPoints: 1000,
        isEmailVerified: true
      });
      console.log(`[Database] Auto-created Admin user: ${adminEmail}`);
    }
  } catch (err) {
    console.warn('[Database Warning] Could not verify/create admin user:', err.message);
  }
};

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;

    // In production, MONGODB_URI is required. Fail early and clearly.
    if (!connStr) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Database FATAL] MONGODB_URI environment variable is not set. The application cannot start without a database connection in production.');
        process.exit(1);
      } else {
        console.warn('[Database] MONGODB_URI not set. Attempting local MongoDB fallback: mongodb://127.0.0.1:27017/ganeshgifting');
      }
    }

    const connectionString = connStr || 'mongodb://127.0.0.1:27017/ganeshgifting';
    console.log(`[Database] Attempting connection to MongoDB...`);
    const conn = await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000, // 10s for Atlas connection (Atlas needs more time than local)
      socketTimeoutMS: 45000,
      maxPoolSize: 100, // Handle up to 10,000 high-concurrency requests
      minPoolSize: 5,
      family: 4 // Prefer IPv4 for fast DNS resolution
    });
    console.log(`[Database] Connected successfully to MongoDB: ${conn.connection.host} (${conn.connection.name})`);
    
    // Ensure admin user exists in DB
    await ensureAdminUser();
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.log(`[Database Warning] Running in resilient fallback DB mode. Public APIs will serve cached/fallback data immediately.`);
  }
};

module.exports = connectDB;
