const express = require('express');
const router = express.Router();
const {
  getBanners, createBanner, updateBanner, deleteBanner,
  getCoupons, getPublicCoupons, createCoupon, validateCoupon,
  getBlogs, getBlogBySlug,
  getJobs,
  submitGrievance, getGrievances, updateGrievance,
  submitSupportTicket, getSupportTickets, respondSupportTicket, deleteSupportTicket,
  submitJobApplication, getJobApplications, updateJobApplication, deleteJobApplication,
  getCompanySettings, updateCompanySettings
} = require('../controllers/contentController');
const { protect, requireAdmin, requireSupportOrAdmin } = require('../middleware/authMiddleware');
const { couponLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/uploadMiddleware');

// ── Banners ──
router.get('/banners', getBanners);
router.post('/banners', protect, requireAdmin, upload.single('image'), createBanner);
router.put('/banners/:id', protect, requireAdmin, upload.single('image'), updateBanner);
router.delete('/banners/:id', protect, requireAdmin, deleteBanner);

// ── Coupons ──
router.get('/public-coupons', getPublicCoupons);
router.get('/coupons', protect, requireAdmin, getCoupons);
router.post('/coupons', protect, requireAdmin, createCoupon);
router.post('/coupons/validate', couponLimiter, validateCoupon);

// ── Blogs & Jobs ──
router.get('/blogs', getBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.get('/jobs', getJobs);

// ── Careers Applications ──
router.post('/careers/apply', submitJobApplication);
router.get('/careers/applications', protect, requireSupportOrAdmin, getJobApplications);
router.put('/careers/applications/:id', protect, requireSupportOrAdmin, updateJobApplication);
router.delete('/careers/applications/:id', protect, requireAdmin, deleteJobApplication);

// ── Help & Support Tickets ──
router.post('/support-ticket', submitSupportTicket);
router.get('/support-tickets', protect, requireSupportOrAdmin, getSupportTickets);
router.put('/support-tickets/:id/respond', protect, requireSupportOrAdmin, respondSupportTicket);
router.delete('/support-tickets/:id', protect, requireAdmin, deleteSupportTicket);

// ── Grievances ──
router.post('/grievance', submitGrievance);
router.get('/grievances', protect, requireSupportOrAdmin, getGrievances);
router.put('/grievances/:id', protect, requireSupportOrAdmin, updateGrievance);

// ── Company Settings (Site-Wide Info) ──
router.get('/company-settings', getCompanySettings);
router.put('/company-settings', protect, requireAdmin, updateCompanySettings);

module.exports = router;
