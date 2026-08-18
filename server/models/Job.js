const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true, default: 'Lucknow / Remote' },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], default: 'Full-time' },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
