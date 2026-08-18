const CorporateInquiry = require('../models/CorporateInquiry');

// @route POST /api/corporate/inquiry
exports.submitInquiry = async (req, res) => {
  try {
    const inquiry = await CorporateInquiry.create(req.body);
    res.status(201).json({ success: true, message: 'Corporate gifting inquiry submitted successfully', inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/corporate/inquiries (Admin Only)
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await CorporateInquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
