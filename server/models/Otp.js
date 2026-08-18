const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otpHash: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['signup', 'login'],
    default: 'signup'
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index automatically removes expired docs
  },
  resendAllowedAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
