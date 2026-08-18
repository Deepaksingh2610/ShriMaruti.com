const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const dayjs = require('dayjs');

// @route GET /api/admin/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Total revenue calculation (includes Razorpay Paid, UPI Verified CONFIRMED, and Delivered orders)
    const paidOrders = await Order.find({
      $or: [
        { paymentStatus: { $in: ['Paid', 'CONFIRMED', 'Confirmed'] } },
        { orderStatus: 'Delivered' }
      ]
    });
    const totalRevenue = paidOrders.reduce((acc, order) => acc + order.pricing.totalAmount, 0);

    // Low stock products alert list
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).select('name stock price images categoryName');

    // Bestseller products count
    const bestsellers = await Product.find({ isBestseller: true }).limit(5);

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // ── Daily Orders Data (last 14 days) ──────────────────────────────────────
    const dailyOrdersRaw = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dayjs().subtract(14, 'day').toDate() }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days with 0
    const dailyOrders = [];
    for (let i = 13; i >= 0; i--) {
      const day = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const found = dailyOrdersRaw.find(d => d._id === day);
      dailyOrders.push({
        date: dayjs().subtract(i, 'day').format('DD MMM'),
        orders: found ? found.orders : 0,
        revenue: found ? found.revenue : 0
      });
    }

    // Today's order count
    const todayStart = dayjs().startOf('day').toDate();
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        lowStockCount: lowStockProducts.length,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0
      },
      dailyOrders,
      lowStockProducts,
      bestsellers,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('name email phone photo addresses loyaltyPoints referralCode createdAt isEmailVerified')
      .sort({ createdAt: -1 });

    // For each user, attach their order count + recent orders
    const userIds = users.map(u => u._id);

    const orderCounts = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.totalAmount' },
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]);

    const orderMap = {};
    orderCounts.forEach(o => {
      orderMap[o._id.toString()] = {
        totalOrders: o.totalOrders,
        totalSpent: o.totalSpent,
        lastOrderDate: o.lastOrderDate
      };
    });

    const enrichedUsers = users.map(u => ({
      ...u.toObject(),
      orderStats: orderMap[u._id.toString()] || { totalOrders: 0, totalSpent: 0, lastOrderDate: null }
    }));

    res.json({ success: true, count: enrichedUsers.length, users: enrichedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/users/:userId/orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/payments
// Returns day-wise paid orders with full user + order details
exports.getPaymentsByDay = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = dayjs().subtract(Number(days), 'day').startOf('day').toDate();

    const paidOrders = await Order.find({
      $or: [
        { paymentStatus: { $in: ['Paid', 'CONFIRMED', 'Confirmed'] } },
        { orderStatus: 'Delivered' }
      ],
      createdAt: { $gte: since }
    })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    // Group by date
    const grouped = {};
    paidOrders.forEach(order => {
      const dateKey = dayjs(order.createdAt).format('YYYY-MM-DD');
      const displayDate = dayjs(order.createdAt).format('DD MMM YYYY');

      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, displayDate, totalRevenue: 0, orderCount: 0, transactions: [] };
      }

      grouped[dateKey].totalRevenue += order.pricing?.totalAmount || 0;
      grouped[dateKey].orderCount += 1;
      grouped[dateKey].transactions.push({
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || order.senderDetails?.name || 'Guest',
        customerEmail: order.user?.email || order.senderDetails?.email || '—',
        customerPhone: order.user?.phone || order.senderDetails?.phone || '—',
        amount: order.pricing?.totalAmount || 0,
        paymentMethod: order.paymentMethod || 'Unknown',
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        utrNumber: order.paymentProof?.utrNumber || null,
        itemCount: order.orderItems?.length || 0,
        items: (order.orderItems || []).slice(0, 3).map(i => i.name),
        createdAt: order.createdAt
      });
    });

    const dayList = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);
    const totalOrders = paidOrders.length;
    const verifiedCount = paidOrders.filter(o => o.paymentStatus === 'CONFIRMED' || o.paymentStatus === 'Paid').length;

    res.json({
      success: true,
      summary: { totalRevenue, totalOrders, days: Number(days), verifiedCount },
      days: dayList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/admin/upload
// Upload single image to Cloudinary and return secure URL + publicId
exports.uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }
    const { processAndUploadImage } = require('../middleware/uploadMiddleware');
    const folder = req.body.folder || 'shrimaruti/uploads';

    // Upload to Cloudinary → returns { url, publicId, hash, reused }
    const { url, publicId, hash, reused } = await processAndUploadImage(req.file.buffer, folder);

    res.json({
      success: true,
      url,
      publicId,
      hash,
      reused,
      message: 'Image uploaded successfully to Cloudinary'
    });
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPI Payment Verification Admin Handlers ─────────────────────────────────────

// @route GET /api/admin/payments/pending
exports.getPendingUPIPayments = async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const payments = await Payment.find()
      .populate({
        path: 'orderId',
        select: 'orderNumber pricing orderItems senderDetails shippingAddress orderStatus paymentStatus createdAt'
      })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/admin/payments/:paymentId/confirm
exports.confirmUPIPayment = async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const Order = require('../models/Order');
    const Notification = require('../models/Notification');

    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const order = await Order.findById(payment.orderId);

    // Prevent duplicate confirmation if both payment & order are already confirmed
    if (payment.paymentStatus === 'CONFIRMED' && order && (order.orderStatus === 'Confirmed' || order.orderStatus === 'CONFIRMED')) {
      return res.status(400).json({
        success: false,
        message: 'Action denied: Payment & Order are already in CONFIRMED state.'
      });
    }

    // Atomically update Payment
    payment.paymentStatus = 'CONFIRMED';
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = payment.verifiedAt || new Date();
    await payment.save();

    // Update associated Order
    if (order) {
      order.paymentStatus = 'CONFIRMED';
      order.orderStatus = 'Confirmed';
      order.paidAt = order.paidAt || new Date();
      order.statusHistory.push({
        status: 'Confirmed',
        updatedBy: req.user?.name || 'Admin',
        note: `Payment verified & confirmed by admin. UTR: ${payment.utrNumber}`
      });
      await order.save();

      // Create User Notification safely
      const targetUserId = payment.userId || order.user;
      if (targetUserId) {
        try {
          await Notification.create({
            userId: targetUserId,
            title: '🎉 Order Confirmed',
            message: `Your payment for order #${order.orderNumber} has been verified successfully. Your order has been placed successfully.`,
            type: 'payment_confirmed',
            orderId: order._id
          });
        } catch (notifErr) {
          console.warn('[Notification Create Warning]:', notifErr.message);
        }
      }
    }

    res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully! ✓',
      payment
    });
  } catch (error) {
    console.error('[Confirm UPI Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/admin/payments/:paymentId/reject
exports.rejectUPIPayment = async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const Order = require('../models/Order');
    const Notification = require('../models/Notification');

    const { rejectionReason } = req.body;
    const reason = rejectionReason?.trim() || 'Payment screenshot is unclear or transaction mismatch.';

    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const order = await Order.findById(payment.orderId);

    if (payment.paymentStatus === 'REJECTED' && order && (order.paymentStatus === 'REJECTED' || order.orderStatus === 'PAYMENT_REJECTED')) {
      return res.status(400).json({
        success: false,
        message: 'Action denied: Payment is already in REJECTED state.'
      });
    }

    // Update Payment
    payment.paymentStatus = 'REJECTED';
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    payment.rejectionReason = reason;
    await payment.save();

    // Update Order
    if (order) {
      order.paymentStatus = 'REJECTED';
      order.orderStatus = 'PAYMENT_REJECTED';
      order.statusHistory.push({
        status: 'PAYMENT_REJECTED',
        updatedBy: req.user?.name || 'Admin',
        note: `Payment rejected: ${reason}`
      });
      await order.save();

      // Send rejection notification safely
      const targetUserId = payment.userId || order.user;
      if (targetUserId) {
        try {
          await Notification.create({
            userId: targetUserId,
            title: 'Payment Verification Failed',
            message: `Your payment for order #${order.orderNumber} could not be verified. Reason: ${reason}. Please check your payment details and contact support or submit valid payment proof.`,
            type: 'payment_rejected',
            orderId: order._id
          });
        } catch (notifErr) {
          console.warn('[Notification Create Warning]:', notifErr.message);
        }
      }
    }

    res.json({
      success: true,
      message: 'Payment rejected. Notification sent to customer.',
      payment
    });
  } catch (error) {
    console.error('[Reject UPI Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPI Settings Admin Handlers ─────────────────────────────────────────

// @route GET /api/admin/upi-settings
exports.getAdminUPISettings = async (req, res) => {
  try {
    const UPISettings = require('../models/UPISettings');
    let settings = await UPISettings.findOne({ isActive: true }).sort({ updatedAt: -1 });

    if (!settings) {
      settings = await UPISettings.create({
        upiId: 'shreemaruti@upi',
        qrCode: {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
          publicId: 'default-qr'
        },
        isActive: true,
        updatedBy: req.user._id
      });
    }

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/admin/upi-settings
exports.updateAdminUPISettings = async (req, res) => {
  try {
    const UPISettings = require('../models/UPISettings');
    const { upiId, isActive } = req.body;

    let settings = await UPISettings.findOne({ isActive: true }).sort({ updatedAt: -1 });

    if (!settings) {
      settings = new UPISettings({
        upiId: upiId || 'shreemaruti@upi',
        qrCode: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop' },
        isActive: isActive !== undefined ? isActive : true,
        updatedBy: req.user._id
      });
    } else {
      if (upiId) settings.upiId = upiId.trim();
      if (isActive !== undefined) settings.isActive = isActive;
      settings.updatedBy = req.user._id;
    }

    await settings.save();
    res.json({ success: true, message: 'UPI settings updated successfully ✓', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/admin/upi-settings/qr
exports.uploadAdminUPIQR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid QR code image' });
    }

    const { processAndUploadImage } = require('../middleware/uploadMiddleware');
    const UPISettings = require('../models/UPISettings');

    // Upload QR image to Cloudinary → shrimaruti/payment-settings
    const { url: qrUrl, publicId: qrPublicId } = await processAndUploadImage(
      req.file.buffer,
      'shrimaruti/payment-settings',
      { maxWidth: 600, maxHeight: 600, quality: 90 }
    );

    let settings = await UPISettings.findOne({ isActive: true }).sort({ updatedAt: -1 });

    if (!settings) {
      settings = new UPISettings({
        upiId: req.body.upiId || 'shreemaruti@upi',
        qrCode: { url: qrUrl, publicId: qrPublicId || `qr_${Date.now()}` },
        isActive: true,
        updatedBy: req.user._id
      });
    } else {
      if (req.body.upiId) settings.upiId = req.body.upiId.trim();
      settings.qrCode = { url: qrUrl, publicId: qrPublicId || `qr_${Date.now()}` };
      settings.updatedBy = req.user._id;
    }

    await settings.save();
    res.json({
      success: true,
      message: 'New QR Code uploaded to Cloudinary & active on site! ✓',
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



