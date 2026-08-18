const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  orderId: { type: String },
  category: { type: String, required: true },
  message: { type: String, required: true },
  attachmentUrl: { type: String },
  adminResponse: { type: String },
  respondedAt: { type: Date },
  respondedBy: { type: String },
  status: { type: String, enum: ['Open', 'In Progress', 'Responded', 'Resolved', 'Closed'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
