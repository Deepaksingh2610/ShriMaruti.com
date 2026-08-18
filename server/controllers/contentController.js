const Banner = require('../models/Banner');
const Blog = require('../models/Blog');
const Job = require('../models/Job');
const Coupon = require('../models/Coupon');
const slugify = require('slugify');
const { processAndUploadImage, deleteCloudinaryAsset } = require('../middleware/uploadMiddleware');
const { getCache, setCache, clearCache, isDbConnected } = require('../utils/cache');
const { fallbackBanners, fallbackBlogs, fallbackJobs, fallbackCoupons } = require('../utils/fallbackData');

// ── Banners ─────────────────────────────────────────────────────────────────
exports.getBanners = async (req, res) => {
  try {
    const type = req.query.type || 'hero';
    const cacheKey = `banners:${type}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, count: cached.length, banners: cached, source: 'cache' });
    }

    if (!isDbConnected()) {
      const fb = fallbackBanners.filter(b => b.type === type);
      return res.json({ success: true, count: fb.length, banners: fb, source: 'fallback' });
    }

    const banners = await Banner.find({ type, isActive: true }).sort({ displayOrder: 1, createdAt: -1 }).lean();
    if (banners && banners.length > 0) {
      setCache(cacheKey, banners, 180); // 3 min cache for banners
      return res.json({ success: true, count: banners.length, banners });
    }

    // DB returned empty, serve fallback
    const fb = fallbackBanners.filter(b => b.type === type);
    res.json({ success: true, count: fb.length, banners: fb, source: 'fallback' });
  } catch (error) {
    console.warn('[Banners Warning]: DB query failed, returning fallback.', error.message);
    const fb = fallbackBanners.filter(b => b.type === (req.query.type || 'hero'));
    res.json({ success: true, count: fb.length, banners: fb, source: 'fallback' });
  }
};

exports.createBanner = async (req, res) => {
  let uploadedMedia = null;
  try {
    const { title, subtitle, ctaText, link, categorySlug, type, displayOrder, isActive } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Banner title is required' });
    }

    let image = req.body.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop';
    let imagePublicId = '';
    let imageHash = '';

    if (req.file) {
      // Upload banner image with deduplication
      uploadedMedia = await processAndUploadImage(
        req.file.buffer,
        'shrimaruti/banners',
        { maxWidth: 1920, maxHeight: 800, quality: 85 }
      );
      image = uploadedMedia.url;
      imagePublicId = uploadedMedia.publicId;
      imageHash = uploadedMedia.hash;
    }

    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle || '',
      ctaText: ctaText || 'Shop Now',
      link: link || (categorySlug ? `/products?category=${categorySlug}` : '/products'),
      categorySlug: categorySlug || '',
      type: type || 'hero',
      image,
      imagePublicId,
      imageHash,
      displayOrder: Number(displayOrder || 0),
      isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true)
    });

    clearCache('banners:');
    res.status(201).json({ success: true, banner });
  } catch (error) {
    if (uploadedMedia && !uploadedMedia.reused && uploadedMedia.publicId) {
      await deleteCloudinaryAsset(uploadedMedia.publicId, uploadedMedia.hash);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    if (req.body.title) banner.title = req.body.title.trim();
    if (req.body.subtitle !== undefined) banner.subtitle = req.body.subtitle;
    if (req.body.ctaText !== undefined) banner.ctaText = req.body.ctaText;
    if (req.body.categorySlug !== undefined) banner.categorySlug = req.body.categorySlug;
    if (req.body.link !== undefined) banner.link = req.body.link;
    if (req.body.type !== undefined) banner.type = req.body.type;
    if (req.body.displayOrder !== undefined) banner.displayOrder = Number(req.body.displayOrder);
    if (req.body.isActive !== undefined) {
      banner.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }

    if (req.file) {
      // Dereference old image safely if replacing
      if (banner.imagePublicId) {
        await deleteCloudinaryAsset(banner.imagePublicId, banner.imageHash);
      }

      // Upload new image with deduplication
      const result = await processAndUploadImage(
        req.file.buffer,
        'shrimaruti/banners',
        { maxWidth: 1920, maxHeight: 800, quality: 85 }
      );
      banner.image = result.url;
      banner.imagePublicId = result.publicId;
      banner.imageHash = result.hash;
    } else if (req.body.image) {
      banner.image = req.body.image;
    }

    await banner.save();

    clearCache('banners:');
    res.json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    if (banner.imagePublicId) {
      await deleteCloudinaryAsset(banner.imagePublicId, banner.imageHash);
    }

    await Banner.deleteOne({ _id: banner._id });

    clearCache('banners:');
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Coupons ─────────────────────────────────────────────────────────────────
exports.getPublicCoupons = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const activeFb = fallbackCoupons.filter(c => c.isActive);
      return res.json({ success: true, coupons: activeFb, source: 'fallback' });
    }

    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: now }
    })
      .select('code discountType discountValue minOrderValue maxDiscount expiryDate description')
      .sort({ minOrderValue: 1 })
      .lean();

    res.json({ success: true, coupons });
  } catch (error) {
    res.json({ success: true, coupons: fallbackCoupons.filter(c => c.isActive), source: 'fallback' });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const cached = getCache('coupons');
    if (cached) {
      return res.json({ success: true, coupons: cached, source: 'cache' });
    }

    if (!isDbConnected()) {
      return res.json({ success: true, coupons: fallbackCoupons, source: 'fallback' });
    }

    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    setCache('coupons', coupons, 60);
    res.json({ success: true, coupons });
  } catch (error) {
    console.warn('[Coupons Warning]: DB query failed, returning fallback.', error.message);
    res.json({ success: true, coupons: fallbackCoupons, source: 'fallback' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    clearCache('coupons');
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

    if (!isDbConnected()) {
      const fb = fallbackCoupons.find(c => c.code === code.toUpperCase());
      if (!fb) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
      return res.json({ success: true, couponCode: fb.code, discount: fb.discountValue, message: 'Coupon applied!' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true }).lean();
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (new Date() > coupon.expiryDate) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (orderAmount < coupon.minOrderValue) return res.status(400).json({ success: false, message: `Minimum order value ₹${coupon.minOrderValue} required` });

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    res.json({ success: true, couponCode: coupon.code, discount, message: 'Coupon applied successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Blogs ───────────────────────────────────────────────────────────────────
exports.getBlogs = async (req, res) => {
  try {
    const cached = getCache('blogs');
    if (cached) {
      return res.json({ success: true, count: cached.length, blogs: cached, source: 'cache' });
    }

    if (!isDbConnected()) {
      return res.json({ success: true, count: fallbackBlogs.length, blogs: fallbackBlogs, source: 'fallback' });
    }

    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
    if (blogs && blogs.length > 0) {
      setCache('blogs', blogs, 300); // 5 min cache for blogs
      return res.json({ success: true, count: blogs.length, blogs });
    }

    res.json({ success: true, count: fallbackBlogs.length, blogs: fallbackBlogs, source: 'fallback' });
  } catch (error) {
    console.warn('[Blogs Warning]: DB query failed, returning fallback.', error.message);
    res.json({ success: true, count: fallbackBlogs.length, blogs: fallbackBlogs, source: 'fallback' });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `blog:${slug}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ success: true, blog: cached, source: 'cache' });

    if (!isDbConnected()) {
      const fb = fallbackBlogs.find(b => b.slug === slug);
      if (fb) return res.json({ success: true, blog: fb, source: 'fallback' });
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const blog = await Blog.findOne({ slug }).lean();
    if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found' });
    setCache(cacheKey, blog, 300);
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Jobs / Careers ──────────────────────────────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const cached = getCache('jobs');
    if (cached) {
      return res.json({ success: true, count: cached.length, jobs: cached, source: 'cache' });
    }

    if (!isDbConnected()) {
      return res.json({ success: true, count: fallbackJobs.length, jobs: fallbackJobs, source: 'fallback' });
    }

    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    if (jobs && jobs.length > 0) {
      setCache('jobs', jobs, 300);
      return res.json({ success: true, count: jobs.length, jobs });
    }

    res.json({ success: true, count: fallbackJobs.length, jobs: fallbackJobs, source: 'fallback' });
  } catch (error) {
    console.warn('[Jobs Warning]: DB query failed, returning fallback.', error.message);
    res.json({ success: true, count: fallbackJobs.length, jobs: fallbackJobs, source: 'fallback' });
  }
};

// ── Grievance Submission ──────────────────────────────────────────────────
const Grievance = require('../models/Grievance');
exports.submitGrievance = async (req, res) => {
  try {
    const { fullName, email, phone, orderId, category, description, documentUrl } = req.body;
    if (!fullName || !email || !phone || !category || !description) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const ticketId = `GRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    if (isDbConnected()) {
      await Grievance.create({
        ticketId,
        fullName,
        email,
        phone,
        orderId,
        category,
        description,
        documentUrl
      });
    }

    res.status(201).json({
      success: true,
      ticketId,
      message: 'Your grievance has been received. Please keep your grievance reference number for future communication.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Support Ticket Submission ─────────────────────────────────────────────
const SupportTicket = require('../models/SupportTicket');
exports.submitSupportTicket = async (req, res) => {
  try {
    const { name, email, orderId, category, message, attachmentUrl } = req.body;
    if (!name || !email || !category || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const ticketId = `SUP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    if (isDbConnected()) {
      await SupportTicket.create({
        ticketId,
        name,
        email,
        orderId,
        category,
        message,
        attachmentUrl
      });
    }

    res.status(201).json({
      success: true,
      ticketId,
      message: 'Support request submitted successfully! Our team will respond shortly.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSupportTickets = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, count: 0, tickets: [] });
    }
    const tickets = await SupportTicket.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.respondSupportTicket = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (status) ticket.status = status;
    if (adminResponse !== undefined) {
      ticket.adminResponse = adminResponse;
      ticket.respondedAt = new Date();
      ticket.respondedBy = req.user?.name || req.user?.email || 'Admin';
    }

    await ticket.save();
    res.json({ success: true, message: 'Support ticket updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSupportTicket = async (req, res) => {
  try {
    await SupportTicket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Support ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Job Applications ──────────────────────────────────────────────────────
const JobApplication = require('../models/JobApplication');
exports.submitJobApplication = async (req, res) => {
  try {
    const { fullName, email, phone, roleApplied, portfolioUrl, resumeUrl, coverNote, jobId } = req.body;
    if (!fullName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Full name, email, and phone are required' });
    }

    const applicationId = `APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    if (isDbConnected()) {
      await JobApplication.create({
        applicationId,
        jobId: jobId || null,
        roleApplied: roleApplied || 'General Application',
        fullName,
        email,
        phone,
        portfolioUrl,
        resumeUrl,
        coverNote
      });
    }

    res.status(201).json({
      success: true,
      applicationId,
      message: 'Application submitted successfully! Our recruitment team will review and contact you.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, count: 0, applications: [] });
    }
    const applications = await JobApplication.find().populate('jobId', 'title department').sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateJobApplication = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const application = await JobApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (status) application.status = status;
    if (adminNotes !== undefined) {
      application.adminNotes = adminNotes;
      application.reviewedAt = new Date();
      application.reviewedBy = req.user?.name || req.user?.email || 'Admin';
    }

    await application.save();
    res.json({ success: true, message: 'Application updated successfully', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJobApplication = async (req, res) => {
  try {
    await JobApplication.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Grievances (Admin) ────────────────────────────────────────────────────
exports.getGrievances = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, count: 0, grievances: [] });
    }
    const grievances = await Grievance.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: grievances.length, grievances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGrievance = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return res.status(404).json({ success: false, message: 'Grievance not found' });

    if (status) grievance.status = status;
    if (resolutionNotes) grievance.resolutionNotes = resolutionNotes;

    await grievance.save();
    res.json({ success: true, message: 'Grievance status updated', grievance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Company Settings (Site-Wide Config) ──────────────────────────────────
const CompanySettings = require('../models/CompanySettings');
exports.getCompanySettings = async (req, res) => {
  try {
    const cached = getCache('company_settings');
    if (cached) return res.json({ success: true, settings: cached, source: 'cache' });

    if (!isDbConnected()) {
      const defaultDoc = new CompanySettings();
      return res.json({ success: true, settings: defaultDoc, source: 'default' });
    }

    let settings = await CompanySettings.findOne({ key: 'primary' }).lean();
    if (!settings) {
      settings = await CompanySettings.create({ key: 'primary' });
    }

    setCache('company_settings', settings, 300);
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCompanySettings = async (req, res) => {
  try {
    const updateData = { ...req.body, updatedBy: req.user?.name || req.user?.email || 'Admin' };
    delete updateData._id;
    delete updateData.key;

    let settings = await CompanySettings.findOneAndUpdate(
      { key: 'primary' },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    clearCache('company_settings');
    res.json({ success: true, message: 'Company settings updated successfully! ✓', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


