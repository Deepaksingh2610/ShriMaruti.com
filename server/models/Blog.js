const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  author: { type: String, default: 'Shri Maruti Editorial' },
  category: { type: String, default: 'Gifting Ideas' }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
