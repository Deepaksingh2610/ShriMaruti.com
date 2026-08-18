const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  orderId: { type: String },
  category: { type: String, required: true },
  description: { type: String, required: true },
  documentUrl: { type: String },
  status: { type: String, enum: ['Received', 'Under Review', 'In Progress', 'Resolved', 'Closed'], default: 'Received' }
}, { timestamps: true });

module.exports = mongoose.model('Grievance', grievanceSchema);
