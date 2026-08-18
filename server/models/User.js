const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [80.9980, 26.8850]
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  fullName: { type: String },
  phone: { type: String },
  houseNumber: { type: String },
  street: { type: String },
  road: { type: String },
  locality: { type: String },
  place: { type: String },
  district: { type: String },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
  location: pointSchema,
  accuracy: { type: Number },
  source: { type: String, enum: ['browser-gps', 'pincode', 'manual', 'default', 'saved-address'], default: 'manual' },
  userConfirmed: { type: Boolean, default: false }
});

const savedLocationSchema = new mongoose.Schema({
  pincode: { type: String },
  houseNumber: { type: String },
  road: { type: String },
  locality: { type: String },
  place: { type: String },
  district: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'India' },
  address: { type: String },
  location: pointSchema,
  accuracy: { type: Number },
  source: { type: String, enum: ['browser-gps', 'pincode', 'manual', 'default', 'saved-address'], default: 'manual' },
  userConfirmed: { type: Boolean, default: false }
}, { _id: false });

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  recipientName: { type: String, required: true },
  occasion: { type: String, enum: ['Birthday', 'Anniversary', 'Festival', 'Other'], default: 'Birthday' },
  date: { type: Date, required: true },
  emailAlertDaysBefore: { type: Number, default: 3 }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'support'], default: 'user' },
  dob: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'unspecified'], default: 'unspecified' },
  savedLocation: savedLocationSchema,
  addresses: [addressSchema],
  reminders: [reminderSchema],
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
  loyaltyPoints: { type: Number, default: 50 },
  refreshToken: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  googleId: { type: String },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  avatar: { type: String },
  otp: { type: String },
  otpExpire: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
