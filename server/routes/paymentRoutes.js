const express = require('express');
const router = express.Router();
const {
  getUPISettings,
  submitUPIPayment,
  getUserPayments,
  getPaymentByOrder
} = require('../controllers/paymentController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/upi-settings', getUPISettings);
router.post('/upi/submit', optionalAuth, upload.single('screenshot'), submitUPIPayment);
router.get('/my-payments', protect, getUserPayments);
router.get('/order/:orderId', optionalAuth, getPaymentByOrder);

module.exports = router;
