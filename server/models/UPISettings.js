const mongoose = require('mongoose');

const upiSettingsSchema = new mongoose.Schema({
  upiId: { type: String, required: true, default: 'shreemaruti@upi' },
  qrCode: {
    url: { type: String, required: true },
    publicId: { type: String }
  },
  isActive: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('UPISettings', upiSettingsSchema);
