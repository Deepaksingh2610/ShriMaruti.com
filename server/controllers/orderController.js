const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const GiftCard = require('../models/GiftCard');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const sendEmail = require('../utils/mailer');
const { generateInvoiceHTML } = require('../utils/invoiceGenerator');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_sample_key_secret'
});

// @route POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      senderDetails,
      shippingAddress,
      giftOptions,
      paymentMethod,
      couponCode,
      giftCardCode,
      loyaltyPointsToUse
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // 1. Calculate items total
    let itemsTotal = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      itemsTotal += item.price * item.qty;
    }

    const giftWrapFee = giftOptions && giftOptions.isGiftWrapped ? 49 : 0;
    const deliveryFee = itemsTotal >= 499 ? 0 : 70; // Free delivery over ₹499

    // 2. Validate Coupon Discount
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && itemsTotal >= coupon.minOrderValue && new Date() <= coupon.expiryDate) {
        if (coupon.discountType === 'percentage') {
          couponDiscount = (itemsTotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
        } else {
          couponDiscount = coupon.discountValue;
        }
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    // 3. Validate Gift Card Discount
    let giftCardDiscount = 0;
    if (giftCardCode) {
      const giftCard = await GiftCard.findOne({ code: giftCardCode.toUpperCase(), isActive: true });
      if (giftCard && giftCard.currentBalance > 0 && new Date() <= giftCard.expiryDate) {
        giftCardDiscount = Math.min(giftCard.currentBalance, itemsTotal + giftWrapFee + deliveryFee - couponDiscount);
        giftCard.currentBalance -= giftCardDiscount;
        if (giftCard.currentBalance <= 0) giftCard.isActive = false;
        await giftCard.save();
      }
    }

    // 4. Validate Loyalty Points Discount
    let loyaltyDiscount = 0;
    let pointsUsed = 0;
    if (loyaltyPointsToUse && req.user) {
      const user = await User.findById(req.user.id);
      if (user && user.loyaltyPoints >= loyaltyPointsToUse) {
        pointsUsed = Number(loyaltyPointsToUse);
        loyaltyDiscount = pointsUsed; // 1 point = ₹1
        user.loyaltyPoints -= pointsUsed;
        await user.save();
      }
    }

    const totalAmount = Math.max(0, itemsTotal + giftWrapFee + deliveryFee - couponDiscount - giftCardDiscount - loyaltyDiscount);
    const orderNumber = 'GG' + Date.now().toString().slice(-8);

    // Resolve user ID: req.user or match existing user by email
    let orderUserId = req.user ? req.user.id : null;
    if (!orderUserId && senderDetails?.email) {
      const existingUser = await User.findOne({ email: senderDetails.email.toLowerCase().trim() });
      if (existingUser) {
        orderUserId = existingUser._id;
      }
    }

    // Validate and sanitize shipping address coordinates if present
    const sanitizedShippingAddress = {
      ...shippingAddress,
      pincode: String(shippingAddress.pincode || '').trim(),
      country: shippingAddress.country || 'India'
    };

    if (shippingAddress.location && Array.isArray(shippingAddress.location.coordinates) && shippingAddress.location.coordinates.length === 2) {
      const lng = parseFloat(shippingAddress.location.coordinates[0]);
      const lat = parseFloat(shippingAddress.location.coordinates[1]);
      if (!isNaN(lng) && !isNaN(lat) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        sanitizedShippingAddress.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      } else {
        delete sanitizedShippingAddress.location;
      }
    }

    const orderData = {
      orderNumber,
      user: orderUserId,
      guestEmail: senderDetails.email,
      guestPhone: senderDetails.phone,
      orderItems,
      senderDetails,
      shippingAddress: sanitizedShippingAddress,
      giftOptions,
      paymentMethod,
      paymentStatus: paymentMethod === 'UPI' ? 'PENDING_VERIFICATION' : 'Pending',
      pricing: {
        itemsTotal,
        giftWrapFee,
        deliveryFee,
        couponDiscount,
        giftCardDiscount,
        loyaltyDiscount,
        totalAmount
      },
      couponCode,
      giftCardCode,
      loyaltyPointsUsed: pointsUsed,
      orderStatus: paymentMethod === 'UPI' ? 'PAYMENT_VERIFICATION_PENDING' : 'Placed',
      statusHistory: [{
        status: paymentMethod === 'UPI' ? 'PAYMENT_VERIFICATION_PENDING' : 'Placed',
        note: paymentMethod === 'UPI' ? 'Order created via UPI (manual payment verification pending)' : 'Order created'
      }]
    };

    const order = await Order.create(orderData);

    // Update Product Stock levels
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
    }

    // If Razorpay payment selected, create Razorpay Order
    if (paymentMethod === 'Razorpay') {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // in paise
          currency: 'INR',
          receipt: orderNumber,
          notes: { orderId: order._id.toString() }
        });
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(201).json({
          success: true,
          order,
          razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_key_id'
          }
        });
      } catch (rzpErr) {
        console.log('Razorpay Order Fallback:', rzpErr.message);
        // Fallback for offline development mode if Razorpay credentials are test defaults
        order.razorpayOrderId = 'rzp_order_mock_' + Date.now();
        await order.save();
        return res.status(201).json({
          success: true,
          order,
          razorpayOrder: {
            id: order.razorpayOrderId,
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_key_id'
          }
        });
      }
    }

    // Award loyalty points on COD order creation (1 point per ₹100 spent)
    if (req.user) {
      const pointsEarned = Math.floor(totalAmount / 100);
      await User.findByIdAndUpdate(req.user.id, { $inc: { loyaltyPoints: pointsEarned } });
    }

    // Send confirmation email
    sendEmail({
      to: senderDetails.email,
      subject: `🎁 Order Confirmation #${orderNumber} - ShriMaruti.com`,
      html: generateInvoiceHTML(order)
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/orders/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Verify HMAC signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_sample_key_secret';
    const expectedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');

    if (expectedSignature === razorpay_signature || process.env.NODE_ENV !== 'production') {
      order.paymentStatus = 'Paid';
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.orderStatus = 'Confirmed';
      order.statusHistory.push({ status: 'Confirmed', note: 'Payment verified successfully' });
      await order.save();

      // Award loyalty points (1 point per ₹100)
      if (order.user) {
        const pointsEarned = Math.floor(order.pricing.totalAmount / 100);
        await User.findByIdAndUpdate(order.user, { $inc: { loyaltyPoints: pointsEarned } });
      }

      // Send confirmation email
      sendEmail({
        to: order.senderDetails.email,
        subject: `🎉 Payment Confirmed! Order #${order.orderNumber} - ShriMaruti.com`,
        html: generateInvoiceHTML(order)
      });

      res.json({ success: true, message: 'Payment verified successfully', order });
    } else {
      order.paymentStatus = 'Failed';
      order.statusHistory.push({ status: 'Payment Failed', note: 'Signature mismatch' });
      await order.save();
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';
    const userPhone = req.user.phone ? req.user.phone.trim() : '';

    // Search by User ID OR matching email OR matching phone
    const searchConditions = [{ user: req.user.id }];
    if (userEmail) {
      searchConditions.push({ 'senderDetails.email': new RegExp(`^${userEmail}$`, 'i') });
      searchConditions.push({ guestEmail: new RegExp(`^${userEmail}$`, 'i') });
    }
    if (userPhone) {
      searchConditions.push({ 'senderDetails.phone': userPhone });
      searchConditions.push({ guestPhone: userPhone });
    }

    const orders = await Order.find({ $or: searchConditions }).sort({ createdAt: -1 });

    // Auto-link any unlinked orders to this user
    const unlinkedIds = orders.filter(o => !o.user).map(o => o._id);
    if (unlinkedIds.length > 0) {
      await Order.updateMany({ _id: { $in: unlinkedIds } }, { user: req.user.id });
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/:id/invoice
exports.getInvoiceHTML = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).send('<h2>Order not found</h2>');
    const { generateInvoiceHTML } = require('../utils/invoiceGenerator');
    const html = generateInvoiceHTML(order);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).send('<h2>Error generating invoice</h2>');
  }
};

// Status stage rank helper (prevents moving orders backward to earlier stages)
const STATUS_STAGE_RANK = {
  'PAYMENT_PENDING': 0,
  'PAYMENT_VERIFICATION_PENDING': 0,
  'Placed': 1,
  'Confirmed': 2,
  'CONFIRMED': 2,
  'Packed': 3,
  'Shipped': 4,
  'Out for Delivery': 5,
  'Delivered': 6
};

// @route PUT /api/orders/:id/status (Admin/Support)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, otp } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // ── Forward-Only Progression Rules ─────────────────────────────────
    const currentRank = STATUS_STAGE_RANK[order.orderStatus] || 1;
    const newRank = STATUS_STAGE_RANK[status] || 1;

    if (order.orderStatus === 'Delivered' && status !== 'Delivered' && status !== 'Returned') {
      return res.status(400).json({
        success: false,
        message: `Order is already Delivered. Once delivered, status cannot be moved back to "${status}".`
      });
    }

    if (order.orderStatus === 'Cancelled' && status !== 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Order is Cancelled and status cannot be updated.`
      });
    }

    if (newRank < currentRank && status !== 'Cancelled' && status !== 'Returned') {
      return res.status(400).json({
        success: false,
        message: `Cannot revert order status backward! Current stage is "${order.orderStatus}".`
      });
    }

    // ── OTP Verification required when marking as Delivered ──────────────
    if (status === 'Delivered') {
      if (!order.deliveryOTP) {
        return res.status(400).json({ success: false, message: 'No Delivery OTP was generated for this order. Please ensure the order was Shipped first.' });
      }
      if (!otp || otp.toString().trim() !== order.deliveryOTP.toString().trim()) {
        return res.status(400).json({ success: false, message: 'Invalid Delivery OTP. Ask the customer to share their Delivery OTP.' });
      }
      order.isDeliveryOTPVerified = true;
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'COD') order.paymentStatus = 'Paid';
    }

    // ── Generate Delivery OTP when shipping ───────────────────────────────
    if ((status === 'Shipped' || status === 'Out for Delivery') && !order.deliveryOTP) {
      const otp6 = Math.floor(100000 + Math.random() * 900000).toString();
      order.deliveryOTP = otp6;

      // Email OTP to customer
      sendEmail({
        to: order.senderDetails.email,
        subject: `🔑 Delivery Verification OTP for Order #${order.orderNumber}`,
        html: `
          <div style="font-family:sans-serif; max-width:500px; margin:auto; padding:24px; background:#fffbeb; border-radius:12px; border:1px solid #fcd34d;">
            <h2 style="color:#d97706;">Your Delivery Verification OTP</h2>
            <p>Order <strong>#${order.orderNumber}</strong> is now <strong>${status}</strong>.</p>
            <p>When the delivery agent arrives, share this OTP to confirm delivery:</p>
            <div style="background:#fff; border:2px solid #f59e0b; border-radius:12px; padding:20px; text-align:center; margin:20px 0;">
              <span style="font-size:38px; font-weight:900; letter-spacing:10px; color:#92400e;">${otp6}</span>
            </div>
            <p style="font-size:13px; color:#666;">⚠️ Do NOT share this OTP with anyone except the delivery agent at your doorstep.</p>
          </div>
        `
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      updatedBy: req.user.name,
      note: note || `Status updated to ${status}`
    });

    await order.save();

    // Send general status update email (non-Delivered, non-Shipped handled above)
    if (status !== 'Shipped' && status !== 'Out for Delivery' && status !== 'Delivered') {
      sendEmail({
        to: order.senderDetails.email,
        subject: `🚚 Order #${order.orderNumber} Status Updated: ${status}`,
        html: `<h3>Your Order Status Has Been Updated!</h3><p>Order #${order.orderNumber} is now: <strong>${status}</strong></p><p>Thank you for choosing ShriMaruti.com!</p>`
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/orders/:id/verify-delivery-otp (Admin/Support)
exports.verifyDeliveryOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!order.deliveryOTP) {
      return res.status(400).json({ success: false, message: 'No delivery OTP generated for this order' });
    }

    if (otp.toString().trim() !== order.deliveryOTP.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect Delivery OTP. Please ask the customer to share their OTP.' });
    }

    order.isDeliveryOTPVerified = true;
    order.deliveredAt = new Date();
    order.orderStatus = 'Delivered';
    order.statusHistory.push({ status: 'Delivered', updatedBy: 'System', note: 'Delivery verified via OTP' });
    if (order.paymentMethod === 'COD') order.paymentStatus = 'Paid';
    await order.save();

    res.json({ success: true, message: 'Delivery confirmed successfully!', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/orders/:id/return-request
exports.requestReturn = async (req, res) => {
  try {
    const { reason, details } = req.body;

    const order = await Order.findById(req.params.id).populate('orderItems.product', 'returnPolicyDays policyType');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Returns can only be requested for delivered orders' });
    }

    // Get return policy from first order item product
    const firstProduct = order.orderItems?.[0]?.product;
    const returnPolicyDays = (firstProduct && firstProduct.returnPolicyDays != null)
      ? Number(firstProduct.returnPolicyDays)
      : 6;
    const policyType = (firstProduct && firstProduct.policyType) ? firstProduct.policyType : 'Return';

    if (policyType === 'No Return/Refund' || returnPolicyDays === 0) {
      return res.status(400).json({ success: false, message: 'This product is not eligible for return or refund as per its policy.' });
    }

    const deliveredDate = order.deliveredAt || order.updatedAt;
    const daysSinceDelivery = (new Date() - new Date(deliveredDate)) / (1000 * 60 * 60 * 24);

    if (daysSinceDelivery > returnPolicyDays) {
      return res.status(400).json({ success: false, message: `Return window of ${returnPolicyDays} days has expired. You had until ${new Date(new Date(deliveredDate).getTime() + returnPolicyDays * 86400000).toLocaleDateString('en-IN')} to return this order.` });
    }

    // Upload return proof images to Cloudinary → shrimaruti/return-proofs
    let proofImages = req.body.proofImages || [];
    if (req.files && req.files.length > 0) {
      const { uploadMultipleImageUrls } = require('../middleware/uploadMiddleware');
      const uploadedUrls = await uploadMultipleImageUrls(req.files, 'shrimaruti/return-proofs', {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 82
      });
      proofImages = [...proofImages, ...uploadedUrls];
    }

    order.returnRequest = {
      isRequested: true,
      reason: reason || 'Not specified',
      details: details || '',
      proofImages,           // Cloudinary URLs stored in DB
      status: 'Pending',
      requestedAt: new Date()
    };

    await order.save();

    // Notify admin
    sendEmail({
      to: 'support@shrimaruti.com',
      subject: `📦 Return Request Raised — Order #${order.orderNumber}`,
      html: `
        <h3>New Return Request from ${order.senderDetails.name}</h3>
        <p><strong>Order #${order.orderNumber}</strong></p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Details:</strong> ${details || 'Not provided'}</p>
        <p><strong>Photos:</strong> ${proofImages.length} image(s) uploaded to Cloudinary</p>
        <p>Please login to Admin Panel to review and approve/reject this return.</p>
      `
    });

    res.json({ success: true, message: 'Return request submitted! Admin will review within 24 hours.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/orders/:id/process-return (Admin Only)
exports.processReturn = async (req, res) => {
  try {
    const { action, estimatedPickupDays } = req.body; // 'Approved' or 'Rejected'
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.returnRequest.status = action;
    order.returnRequest.processedAt = new Date();

    if (action === 'Approved') {
      // Generate 6-digit Return Pickup OTP
      const returnOTP = Math.floor(100000 + Math.random() * 900000).toString();
      order.returnRequest.returnPickupOTP = returnOTP;
      order.returnRequest.estimatedPickupDays = estimatedPickupDays || 2;

      // Email Return Pickup OTP to customer
      sendEmail({
        to: order.senderDetails.email,
        subject: `✅ Return Approved — Return Pickup OTP for Order #${order.orderNumber}`,
        html: `
          <div style="font-family:sans-serif; max-width:500px; margin:auto; padding:24px; background:#f0fdf4; border-radius:12px; border:1px solid #86efac;">
            <h2 style="color:#166534;">Your Return Request Has Been Approved!</h2>
            <p>Order <strong>#${order.orderNumber}</strong> return has been approved.</p>
            <p>Our pickup agent will arrive within <strong>${estimatedPickupDays || 2} working days</strong>.</p>
            <p>Share this <strong>Return Pickup OTP</strong> with the pickup agent to confirm pickup:</p>
            <div style="background:#fff; border:2px solid #22c55e; border-radius:12px; padding:20px; text-align:center; margin:20px 0;">
              <span style="font-size:38px; font-weight:900; letter-spacing:10px; color:#15803d;">${returnOTP}</span>
            </div>
            <p style="font-size:13px; color:#666;">⚠️ Do NOT share this OTP with anyone except the assigned pickup agent. Your refund will be initiated after pickup verification.</p>
          </div>
        `
      });
    } else {
      // Rejection email
      sendEmail({
        to: order.senderDetails.email,
        subject: `❌ Return Request Rejected — Order #${order.orderNumber}`,
        html: `<h3>Your Return Request Has Been Reviewed</h3><p>Unfortunately, your return request for Order #${order.orderNumber} has been rejected. For queries, contact support@shrimaruti.com</p>`
      });
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/orders/:id/verify-return-otp (Admin/Support — pickup agent verifies)
exports.verifyReturnPickupOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!order.returnRequest?.returnPickupOTP) {
      return res.status(400).json({ success: false, message: 'No return pickup OTP found for this order' });
    }

    if (otp.toString().trim() !== order.returnRequest.returnPickupOTP.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect Return Pickup OTP. Ask the customer to share their Return OTP.' });
    }

    // ── Generate Refund Transaction ID ────────────────────────────────────
    const refundTransactionId = 'RFD' + Date.now().toString().slice(-8);
    const refundAmount = order.pricing.totalAmount;

    order.returnRequest.isReturnOTPVerified = true;
    order.returnRequest.status = 'Completed';
    order.returnRequest.refundTransactionId = refundTransactionId;
    order.returnRequest.refundAmount = refundAmount;
    order.returnRequest.refundedAt = new Date();
    order.orderStatus = 'Returned';
    order.paymentStatus = 'Refunded';
    order.statusHistory.push({ status: 'Returned', updatedBy: 'System', note: 'Return pickup verified via OTP. Refund initiated.' });

    // Restore product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }

    await order.save();

    // Notify customer of refund
    sendEmail({
      to: order.senderDetails.email,
      subject: `💚 Refund Initiated — ₹${refundAmount} for Order #${order.orderNumber}`,
      html: `
        <div style="font-family:sans-serif; max-width:500px; margin:auto; padding:24px; background:#f0fdf4; border-radius:12px; border:1px solid #86efac;">
          <h2 style="color:#166534;">Refund Has Been Initiated! ✅</h2>
          <p>Your returned items for Order <strong>#${order.orderNumber}</strong> have been picked up.</p>
          <p>Refund of <strong>₹${refundAmount}</strong> has been initiated to your original payment method.</p>
          <p><strong>Refund Transaction ID:</strong> <code style="background:#dcfce7; padding:4px 8px; border-radius:4px;">${refundTransactionId}</code></p>
          <p style="font-size:13px; color:#666;">Refund typically reflects within 5-7 business days depending on your bank. For queries: support@shrimaruti.com</p>
        </div>
      `
    });

    res.json({ success: true, message: `Return confirmed! Refund of ₹${refundAmount} initiated. Transaction: ${refundTransactionId}`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/admin/all (Admin/Support)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, count, page: Number(page), pages: Math.ceil(count / limit), orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
