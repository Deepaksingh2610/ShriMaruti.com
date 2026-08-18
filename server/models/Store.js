const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  storeType: {
    type: String,
    enum: ['flagship', 'hub', 'partner_store', 'warehouse'],
    default: 'hub'
  },
  address: {
    type: String,
    required: true
  },
  locality: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  district: {
    type: String
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  deliveryRadiusKm: {
    type: Number,
    default: 25,
    min: 1,
    max: 200
  },
  servicePincodes: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isOpenNow: {
    type: Boolean,
    default: true
  },
  // GeoJSON Point for 2dsphere indexing and geospatial distance queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, { timestamps: true });

// Create 2dsphere index for high-performance geospatial queries
storeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Store', storeSchema);
