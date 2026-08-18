const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['payment_pending', 'payment_confirmed', 'payment_rejected', 'order_update'],
    default: 'payment_pending'
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
