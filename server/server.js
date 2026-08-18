require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const initCronJobs = require('./utils/cronJobs');
const errorHandler = require('./middleware/errorHandler');
const { cacheStore } = require('./utils/cache');

// Initialize Express App
const app = express();

// ── CORS ─── allow whitelisted origins & onrender.com domains ────────────────
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  // Local development
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  // All Render domains (both static sites and backend services on Render)
  if (origin.endsWith('.onrender.com')) return true;
  // Explicitly configured CLIENT_URL (with or without trailing slash)
  if (process.env.CLIENT_URL) {
    const cleanClientUrl = process.env.CLIENT_URL.trim().replace(/\/+$/, '');
    const cleanOrigin = origin.trim().replace(/\/+$/, '');
    if (cleanClientUrl === cleanOrigin) return true;
  }
  return false;
};

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    // In non-production environments, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: Origin '${origin}' is not allowed`));
  },
  credentials: true
}));
app.use(compression());
// Use combined log format in production (structured for log aggregators), dev format locally
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// --- Rate Limiting for High Concurrency (10k users) ---
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 200,                  // max 200 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                   // max 20 auth attempts per 15 min
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Dynamic SEO Endpoints
app.use('/', require('./routes/seoRoutes'));

// API Route Mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/giftcards', require('./routes/giftCardRoutes'));
app.use('/api/corporate', require('./routes/corporateRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));

// Health Check Root (enhanced — shows DB state + cache stats)
app.get('/health', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const cacheSize = typeof cacheStore !== 'undefined' ? (cacheStore.size || 0) : 'N/A';
  res.json({
    success: true,
    status: 'Active',
    service: 'ShriMaruti API',
    environment: process.env.NODE_ENV || 'development',
    database: dbState[mongoose.connection.readyState] || 'unknown',
    cacheEntries: cacheSize,
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date()
  });
});

// Root / Home endpoint — Serves Frontend if dist exists, otherwise returns API Welcome status
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/sitemap.xml' || req.path === '/robots.txt') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      service: 'ShriMaruti API Server',
      status: 'Live & Operational 🚀',
      message: 'Welcome to ShriMaruti.com Backend REST API',
      health: '/health',
      apiEndpoints: {
        products: '/api/products',
        categories: '/api/categories',
        banners: '/api/content/banners',
        companySettings: '/api/content/company-settings'
      },
      frontendNote: 'Frontend React UI is deployed as a Render Static Site or build client/dist to serve monolithically.'
    });
  });
}

// Centralized Error Handling Middleware
app.use(errorHandler);

// ── Async Startup: await DB connection BEFORE server starts listening ───────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Await MongoDB connection first — prevents routes from handling requests before DB is ready
  await connectDB();

  // Initialize background Cron Jobs after DB is confirmed connected
  initCronJobs();

  const server = app.listen(PORT, () => {
    console.log(`[ShriMaruti API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Fallback Port Listener if PORT is occupied
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = Number(PORT) + 1;
      console.warn(`[Port Conflict] Port ${PORT} is occupied. Attempting fallback to port ${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log(`[ShriMaruti API] Server running successfully on fallback port ${fallbackPort}`);
      });
    } else {
      console.error('[Server Error]:', err);
    }
  });
};

startServer();

// --- Graceful Crash Handlers (prevents silent crashes under load) ---
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err.message);
  // Keep server alive — log the error but don't exit
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Promise Rejection:', reason);
  // Keep server alive — log the error but don't exit
});
