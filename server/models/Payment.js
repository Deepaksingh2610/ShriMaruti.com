const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentMethod: { type: String, default: 'UPI' },
  amount: { type: Number, required: true },
  utrNumber: { type: String, required: true, trim: true },
  paymentScreenshot: {
    url: { type: String, required: true },
    publicId: { type: String }
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING_VERIFICATION', 'CONFIRMED', 'REJECTED'],
    default: 'PENDING_VERIFICATION'
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  rejectionReason: { type: String },
  upiIdUsed: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
