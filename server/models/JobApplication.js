const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  roleApplied: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  portfolioUrl: { type: String },
  resumeUrl: { type: String },
  coverNote: { type: String },
  status: {
    type: String,
    enum: ['New', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Hired', 'Rejected'],
    default: 'New'
  },
  adminNotes: { type: String },
  reviewedBy: { type: String },
  reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
