const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  googleAuthPopup,
  verifyOtp,
  resendOtp,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  addReminder,
  updateLocation
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.post('/google-popup', authLimiter, googleAuthPopup);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/location', protect, updateLocation);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.post('/reminders', protect, addReminder);

module.exports = router;
