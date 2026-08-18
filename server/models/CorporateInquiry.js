const mongoose = require('mongoose');

const corporateInquirySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  quantity: { type: Number, default: 10 },
  numberOfGifts: { type: Number },
  preferredDate: { type: String },
  budgetPerGift: { type: String },
  occasion: { type: String },
  gstin: { type: String },
  notes: { type: String },
  message: { type: String },
  status: { type: String, enum: ['New', 'Contacted', 'Quoted', 'Closed'], default: 'New' }
}, { timestamps: true });

module.exports = mongoose.model('CorporateInquiry', corporateInquirySchema);
