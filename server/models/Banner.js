const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  ctaText: { type: String, default: 'Shop Now' },
  link: { type: String, default: '/products' },
  image: { type: String, required: true },
  imagePublicId: { type: String },
  imageHash: { type: String },
  categorySlug: { type: String }, // Target category to open when clicked
  type: { type: String, enum: ['hero', 'promo', 'story'], default: 'hero' }, // hero carousel, pre-footer promo banner, or brand story
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
