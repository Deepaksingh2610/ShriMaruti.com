const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  publicId: {
    type: String,
    trim: true,
    default: ''
  },
  folder: {
    type: String,
    default: 'shrimaruti/uploads'
  },
  bytes: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: 'image/webp'
  },
  refCount: {
    type: Number,
    default: 1,
    min: 0
  },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
