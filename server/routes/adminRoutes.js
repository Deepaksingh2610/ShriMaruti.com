const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, getUserOrders, getPaymentsByDay, uploadSingleImage,
  getPendingUPIPayments, confirmUPIPayment, rejectUPIPayment,
  getAdminUPISettings, updateAdminUPISettings, uploadAdminUPIQR
} = require('../controllers/adminController');
const { protect, requireSupportOrAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/dashboard-stats', protect, requireSupportOrAdmin, getDashboardStats);
router.get('/users', protect, requireSupportOrAdmin, getAllUsers);
router.get('/users/:userId/orders', protect, requireSupportOrAdmin, getUserOrders);
router.get('/payments', protect, requireSupportOrAdmin, getPaymentsByDay);
router.post('/upload', protect, requireSupportOrAdmin, upload.single('image'), uploadSingleImage);

// UPI Payment Verification Admin Routes
router.get('/payments/pending', protect, requireSupportOrAdmin, getPendingUPIPayments);
router.patch('/payments/:paymentId/confirm', protect, requireSupportOrAdmin, confirmUPIPayment);
router.patch('/payments/:paymentId/reject', protect, requireSupportOrAdmin, rejectUPIPayment);

// UPI Settings Admin Routes
router.get('/upi-settings', protect, requireSupportOrAdmin, getAdminUPISettings);
router.patch('/upi-settings', protect, requireSupportOrAdmin, updateAdminUPISettings);
router.post('/upi-settings/qr', protect, requireSupportOrAdmin, upload.single('qrCode'), uploadAdminUPIQR);

module.exports = router;



