const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  image: { type: String, required: true },
  imagePublicId: { type: String },
  imageHash: { type: String },
  isFeatured: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
