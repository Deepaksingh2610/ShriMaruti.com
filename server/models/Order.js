const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  variantName: { type: String }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'System' },
  note: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for guest checkout
  guestEmail: { type: String },
  guestPhone: { type: String },
  orderItems: [orderItemSchema],
  senderDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    houseNumber: { type: String },
    street: { type: String, required: true },
    road: { type: String },
    locality: { type: String },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      }
    },
    accuracy: { type: Number },
    accuracyLevel: { type: String },
    source: { type: String, enum: ['browser-gps', 'pincode', 'manual', 'saved-address', 'checkout-confirmed', 'default'], default: 'checkout-confirmed' },
    userConfirmed: { type: Boolean, default: true }
  },
  giftOptions: {
    isGiftWrapped: { type: Boolean, default: false },
    giftWrapFee: { type: Number, default: 0 },
    giftMessage: { type: String },
    isShipToDifferent: { type: Boolean, default: false }
  },
  paymentMethod: { type: String, enum: ['Razorpay', 'COD', 'UPI'], required: true },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'PENDING_VERIFICATION', 'CONFIRMED', 'Confirmed', 'REJECTED', 'Rejected', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentProof: {
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    utrNumber: { type: String },
    screenshotUrl: { type: String }
  },
  pricing: {
    itemsTotal: { type: Number, required: true },
    giftWrapFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    giftCardDiscount: { type: Number, default: 0 },
    loyaltyDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },
  couponCode: { type: String },
  giftCardCode: { type: String },
  loyaltyPointsUsed: { type: Number, default: 0 },
  orderStatus: {
    type: String,
    enum: ['PAYMENT_PENDING', 'PAYMENT_VERIFICATION_PENDING', 'Placed', 'Confirmed', 'CONFIRMED', 'PAYMENT_REJECTED', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Placed'
  },
  statusHistory: [statusHistorySchema],
  paidAt: { type: Date },
  // ... existing fields remain unchanged

  deliveryOTP: { type: String },
  isDeliveryOTPVerified: { type: Boolean, default: false },
  returnRequest: {
    isRequested: { type: Boolean, default: false },
    reason: { type: String },
    details: { type: String },
    proofImages: [{ type: String }],
    status: {
      type: String,
      enum: ['None', 'Pending', 'Approved', 'Rejected', 'Completed'],
      default: 'None'
    },
    requestedAt: { type: Date },
    processedAt: { type: Date },
    estimatedPickupDays: { type: Number },
    returnPickupOTP: { type: String },
    isReturnOTPVerified: { type: Boolean, default: false },
    refundTransactionId: { type: String },
    refundAmount: { type: Number },
    refundedAt: { type: Date }
  },
  abandonedCartReminderSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
