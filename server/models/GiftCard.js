const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  initialBalance: { type: Number, required: true },
  currentBalance: { type: Number, required: true },
  purchaserName: { type: String, required: true },
  purchaserEmail: { type: String, required: true },
  recipientName: { type: String, required: true },
  recipientEmail: { type: String, required: true },
  giftMessage: { type: String },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('GiftCard', giftCardSchema);
