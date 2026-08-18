const Payment = require('../models/Payment');
const Order = require('../models/Order');
const UPISettings = require('../models/UPISettings');
const Notification = require('../models/Notification');
const { processAndUploadImage } = require('../middleware/uploadMiddleware');

// @route GET /api/payment/upi-settings
// Public / Auth endpoint to fetch active UPI ID & QR Code
exports.getUPISettings = async (req, res) => {
  try {
    let settings = await UPISettings.findOne({ isActive: true }).sort({ updatedAt: -1 });

    if (!settings) {
      // Fallback default active settings if DB does not have any record yet
      settings = {
        upiId: 'shreemaruti@upi',
        qrCode: {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
          publicId: 'default-upi-qr'
        },
        isActive: true
      };
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/payment/upi/submit
// Submit payment proof (Screenshot + UTR Number)
exports.submitUPIPayment = async (req, res) => {
  try {
    const { orderId, utrNumber } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const validateUTRHelper = (utr) => {
      if (!utr) return { isValid: false, message: 'Please enter your UTR / Transaction ID.' };
      const cleanUtr = utr.trim().toUpperCase();

      if (cleanUtr.length < 12 || cleanUtr.length > 18) {
        return {
          isValid: false,
          message: `Invalid UTR length. Transaction ID / UTR must be 12 to 18 characters long. (Currently ${cleanUtr.length} chars)`
        };
      }

      if (!/^[A-Z0-9]+$/.test(cleanUtr)) {
        return {
          isValid: false,
          message: 'Invalid UTR format. Transaction ID must contain only letters and numbers (no spaces or special characters).'
        };
      }

      if (/^([A-Z0-9])\1+$/.test(cleanUtr)) {
        return {
          isValid: false,
          message: 'Invalid UTR: Transaction ID cannot consist of repetitive single characters (e.g. 000000000000).'
        };
      }

      const dummySequences = ['123456789012', '012345678901', '987654321098', '1234567890123', '000000000000'];
      if (dummySequences.includes(cleanUtr)) {
        return {
          isValid: false,
          message: 'Invalid UTR: Please enter your real 12-digit UPI reference / UTR number from PhonePe, GPay, or Paytm.'
        };
      }

      return { isValid: true };
    };

    const utrCheck = validateUTRHelper(utrNumber);
    if (!utrCheck.isValid) {
      return res.status(400).json({ success: false, message: utrCheck.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload your payment screenshot.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if payment proof is already pending or confirmed
    if (order.paymentStatus === 'CONFIRMED') {
      return res.status(400).json({ success: false, message: 'This payment has already been verified and confirmed.' });
    }

    // Upload screenshot to Cloudinary → shrimaruti/payment-screenshots
    const { url: imageUrl, publicId: imagePublicId } = await processAndUploadImage(
      req.file.buffer,
      'shrimaruti/payment-screenshots',
      { maxWidth: 1200, maxHeight: 1600, quality: 88, format: 'webp' }
    );

    // Get current UPI ID used
    const activeUPI = await UPISettings.findOne({ isActive: true }).sort({ updatedAt: -1 });
    const upiIdUsed = activeUPI ? activeUPI.upiId : 'shreemaruti@upi';

    // Create Payment record with Cloudinary URL stored in DB
    const payment = await Payment.create({
      orderId: order._id,
      userId: req.user ? req.user._id : order.user,
      paymentMethod: 'UPI',
      amount: order.pricing?.totalAmount || 0,
      utrNumber: utrNumber.trim(),
      paymentScreenshot: {
        url: imageUrl,
        publicId: imagePublicId || `screenshot_${Date.now()}`
      },
      paymentStatus: 'PENDING_VERIFICATION',
      upiIdUsed
    });

    // Update Order state
    order.paymentStatus = 'PENDING_VERIFICATION';
    order.orderStatus = 'PAYMENT_VERIFICATION_PENDING';
    order.paymentProof = {
      paymentId: payment._id,
      utrNumber: utrNumber.trim(),
      screenshotUrl: imageUrl
    };
    order.statusHistory.push({
      status: 'PAYMENT_VERIFICATION_PENDING',
      updatedBy: 'Customer',
      note: `Payment proof submitted with UTR: ${utrNumber.trim()}`
    });
    await order.save();

    // Send notification to user
    const targetUserId = req.user ? req.user._id : order.user;
    if (targetUserId) {
      await Notification.create({
        userId: targetUserId,
        title: 'Payment Verification Pending',
        message: `Your payment proof for order #${order.orderNumber} has been submitted successfully. Your order will be confirmed within a few minutes after verification by our admin team.`,
        type: 'payment_pending',
        orderId: order._id
      });
    }

    res.status(201).json({
      success: true,
      payment,
      message: 'Your payment proof has been submitted. Your order will be confirmed within a few minutes after admin verification.'
    });
  } catch (error) {
    console.error('[Submit UPI Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/payment/my-payments
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('orderId', 'orderNumber pricing orderStatus')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/payment/order/:orderId
exports.getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId })
      .sort({ createdAt: -1 });

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
