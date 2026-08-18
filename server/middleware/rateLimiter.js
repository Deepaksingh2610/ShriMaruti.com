const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per IP
  message: { success: false, message: 'Too many login/signup attempts, please try again after 15 minutes.' }
});

const couponLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many coupon validation attempts. Please wait a few minutes.' }
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // max 10 requests per IP
  message: { success: false, message: 'Too many OTP requests from this IP. Please try again after 5 minutes.' }
});

module.exports = { authLimiter, couponLimiter, otpLimiter };
