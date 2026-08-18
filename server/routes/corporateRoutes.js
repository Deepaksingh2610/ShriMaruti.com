const express = require('express');
const router = express.Router();
const { submitInquiry, getInquiries } = require('../controllers/corporateController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.post('/inquiry', submitInquiry);
router.get('/inquiries', protect, requireAdmin, getInquiries);

module.exports = router;
