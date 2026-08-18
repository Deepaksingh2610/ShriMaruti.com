const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMyOrders, getOrderById, updateOrderStatus, requestReturn, processReturn, getAllOrders, getInvoiceHTML, verifyDeliveryOTP, verifyReturnPickupOTP } = require('../controllers/orderController');
const { protect, optionalAuth, requireSupportOrAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/', optionalAuth, createOrder); // Allows guest or authenticated checkout
router.post('/verify-payment', verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/all', protect, requireSupportOrAdmin, getAllOrders);
router.get('/:id', getOrderById);
router.get('/:id/invoice', getInvoiceHTML);
router.put('/:id/status', protect, requireSupportOrAdmin, updateOrderStatus);
router.post('/:id/verify-delivery-otp', protect, requireSupportOrAdmin, verifyDeliveryOTP);
// proofImages: up to 5 photos showing damage/issue — uploaded to Cloudinary
router.post('/:id/return-request', protect, upload.array('proofImages', 5), requestReturn);
router.put('/:id/process-return', protect, requireSupportOrAdmin, processReturn);
router.post('/:id/verify-return-otp', protect, requireSupportOrAdmin, verifyReturnPickupOTP);

module.exports = router;
