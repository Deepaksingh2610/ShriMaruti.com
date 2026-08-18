const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: { type: String },
  name: { type: String }, // e.g. "Small", "Red", "Wooden Base"
  size: { type: String },
  color: { type: String },
  material: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  stock: { type: Number, default: 10 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  categoryName: { type: String }, // cached for speed
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 20, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  images: [{ type: String, required: true }],
  imagePublicIds: [{ type: String }],
  imageHashes: [{ type: String }],
  description: { type: String, required: true },
  whyBuy: [{ type: String }],
  isBestseller: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: true },
  isLuxe: { type: Boolean, default: false },
  rating: { type: Number, default: 4.8 },
  numReviews: { type: Number, default: 12 },
  variants: [variantSchema],
  metaTitle: { type: String },
  metaDescription: { type: String },
  tags: [{ type: String }],
  policyType: { type: String, enum: ['Return', 'Refund', 'Replacement', 'No Return/Refund'], default: 'Return' },
  returnPolicyDays: { type: Number, default: 7, min: 0, max: 7 }, // Return/Refund window in days (0 to 7 days)
  policyTerms: { type: String, default: 'Product can be returned or refunded within valid days if undamaged with original packaging.' }
}, { timestamps: true });

// Auto calculate discount percentage virtual
productSchema.virtual('discountPercent').get(function () {
  if (this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
