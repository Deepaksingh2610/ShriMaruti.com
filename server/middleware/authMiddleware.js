const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ganeshgifting_super_secret_jwt_access_token_key_2026');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }
};

const requireSupportOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'support')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Staff access required' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ganeshgifting_super_secret_jwt_access_token_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore invalid token for optional auth
    }
  }
  next();
};

module.exports = { protect, optionalAuth, requireAdmin, requireSupportOrAdmin };

