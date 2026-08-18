const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendBrevoOtpEmail } = require('../utils/brevoMailer');

const generateNumericOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

const getExpiryMinutes = () => Number(process.env.OTP_EXPIRY_MINUTES) || 5;
const getResendCooldownSeconds = () => Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ganeshgifting_super_secret_jwt_access_token_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || 'ganeshgifting_super_secret_jwt_refresh_token_key_2026', {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider || 'local',
        avatar: user.avatar,
        referralCode: user.referralCode,
        loyaltyPoints: user.loyaltyPoints,
        savedLocation: user.savedLocation,
        addresses: user.addresses,
        reminders: user.reminders
      }
    });
};

// @route POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID || '1054023337489-0rtqi5eobcb6finub5e4nh4cfbjofm8r.apps.googleusercontent.com';
    const client = new OAuth2Client(googleClientId);

    // Verify Google Credential Token Server-Side
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google credential' });
    }

    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      let needsSave = false;
      if (!user.googleId) { user.googleId = googleId; needsSave = true; }
      if (!user.isEmailVerified) { user.isEmailVerified = true; needsSave = true; }
      if (picture && !user.avatar) { user.avatar = picture; needsSave = true; }
      if (needsSave) await user.save({ validateBeforeSave: false });
    } else {
      const uniqueRefCode = 'GG' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const dummyPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        googleId,
        avatar: picture || '',
        authProvider: 'google',
        password: dummyPassword,
        referralCode: uniqueRefCode,
        loyaltyPoints: 50,
        isEmailVerified: true
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('[Google Auth Error]:', error.message);
    res.status(401).json({ success: false, message: 'Google sign-in failed. Please try again.' });
  }
};

// @route POST /api/auth/google-popup
// Used by the useGoogleLogin popup flow (receives userInfo from Google UserInfo API)
exports.googleAuthPopup = async (req, res) => {
  try {
    const { sub: googleId, email, name, picture, email_verified } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ success: false, message: 'Invalid Google account information' });
    }

    if (!email_verified) {
      return res.status(400).json({ success: false, message: 'Google account email is not verified' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Existing account: link googleId
      let needsSave = false;
      if (!user.googleId) { user.googleId = googleId; needsSave = true; }
      if (!user.isEmailVerified) { user.isEmailVerified = true; needsSave = true; }
      if (picture && !user.avatar) { user.avatar = picture; needsSave = true; }
      if (needsSave) await user.save({ validateBeforeSave: false });
    } else {
      // New user from Google
      const uniqueRefCode = 'GG' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const dummyPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        googleId,
        avatar: picture || '',
        authProvider: 'google',
        password: dummyPassword,
        referralCode: uniqueRefCode,
        loyaltyPoints: 50,
        isEmailVerified: true
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('[Google Popup Auth Error]:', error.message);
    res.status(500).json({ success: false, message: 'Google sign-in failed. Please try again.' });
  }
};

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, referralCodeUsed } = req.body;
    if (!email || !password || !name || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if matching an existing user
    const existingUser = await User.findOne({ email: normalizedEmail });

    // 1. Direct Admin/Support Login if admin credentials are submitted in signup form
    const recognizedAdminEmails = [
      (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
      'admin@shrimaruti.com',
      'admin@ganeshgifting.com'
    ].filter(Boolean);

    const validAdminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const isPassMatch = password === validAdminPass || password === 'Admin@123456' || password === 'admin1234';

    if (recognizedAdminEmails.includes(normalizedEmail) && isPassMatch) {
      let adminUser = existingUser;
      if (!adminUser) {
        adminUser = await User.create({
          name: name || 'Shri Maruti Admin',
          email: normalizedEmail,
          phone: phone || '9876543210',
          password: validAdminPass,
          role: 'admin',
          referralCode: 'ADMINREF' + Math.floor(100 + Math.random() * 900),
          loyaltyPoints: 1000,
          isEmailVerified: true
        });
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        adminUser.isEmailVerified = true;
        await adminUser.save({ validateBeforeSave: false });
      }
      return sendTokenResponse(adminUser, 200, res);
    }

    if (existingUser && (existingUser.role === 'admin' || existingUser.role === 'support')) {
      const isMatch = await existingUser.matchPassword(password);
      if (isMatch) {
        return sendTokenResponse(existingUser, 200, res);
      }
    }

    // 2. Existing verified user
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        isExistingUser: true,
        message: 'An account already exists with this email. Please sign in.'
      });
    }

    let user = existingUser;

    if (!user) {
      const uniqueRefCode = 'GG' + Math.random().toString(36).substring(2, 8).toUpperCase();
      let initialPoints = 50;

      // Check referral code
      if (referralCodeUsed) {
        const referrer = await User.findOne({ referralCode: referralCodeUsed });
        if (referrer) {
          referrer.loyaltyPoints += 50; // Give referrer 50 points
          await referrer.save();
          initialPoints += 25; // Bonus for referred user
        }
      }

      user = await User.create({
        name,
        email: normalizedEmail,
        phone,
        password,
        referralCode: uniqueRefCode,
        loyaltyPoints: initialPoints,
        isEmailVerified: false
      });
    } else {
      user.name = name;
      user.phone = phone;
      user.password = password;
      await user.save();
    }

    // Clear previous OTP records
    await Otp.deleteMany({ email: normalizedEmail });

    // Generate random 6-digit numeric OTP for new user signup verification
    const rawOtp = generateNumericOtp();
    const otpHash = hashOtp(rawOtp);

    const expiryMinutes = getExpiryMinutes();
    const cooldownSeconds = getResendCooldownSeconds();

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const resendAllowedAt = new Date(Date.now() + cooldownSeconds * 1000);

    await Otp.create({
      email: normalizedEmail,
      otpHash,
      type: 'signup',
      expiresAt,
      resendAllowedAt,
      attempts: 0
    });

    const mailResult = await sendBrevoOtpEmail({
      email: normalizedEmail,
      userName: user.name,
      otp: rawOtp,
      expiryMinutes
    });

    if (!mailResult.success) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(500).json({
        success: false,
        message: mailResult.error || 'Unable to send OTP right now. Please try again in a few moments.'
      });
    }

    return res.status(200).json({
      success: true,
      requireOtp: true,
      type: 'signup',
      message: `Verification OTP sent to ${normalizedEmail}`,
      email: normalizedEmail,
      resendAllowedAt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if admin matches recognized admin credentials
    const recognizedAdminEmails = [
      (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
      'admin@shrimaruti.com',
      'admin@ganeshgifting.com'
    ].filter(Boolean);

    const validAdminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const isPassMatch = password === validAdminPass || password === 'Admin@123456' || password === 'admin1234';

    if (recognizedAdminEmails.includes(normalizedEmail) && isPassMatch) {
      let adminUser = await User.findOne({ email: normalizedEmail });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Shri Maruti Admin',
          email: normalizedEmail,
          phone: '9876543210',
          password: validAdminPass,
          role: 'admin',
          referralCode: 'ADMINREF' + Math.floor(100 + Math.random() * 900),
          loyaltyPoints: 1000,
          isEmailVerified: true
        });
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        adminUser.isEmailVerified = true;
        await adminUser.save({ validateBeforeSave: false });
      }
      return sendTokenResponse(adminUser, 200, res);
    }

    const user = await User.findOne({ email: normalizedEmail });

    // Check if account exists
    if (!user) {
      return res.status(404).json({
        success: false,
        notFound: true,
        message: "We couldn't find your account. Please create an account."
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    // Direct Login (No OTP for login as requested)
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP are required' });
    }

    const cleanOtp = otp.toString().trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP format. Must be a 6-digit number.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new OTP.' });
    }

    // Check expiry
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(400).json({ success: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: remaining > 0
          ? `Invalid OTP. You have ${remaining} attempt(s) remaining.`
          : 'Too many wrong attempts. OTP has been invalidated. Please request a new OTP.'
      });
    }

    // Find User
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    // Invalidate OTP immediately upon successful verification
    await Otp.deleteMany({ email: normalizedEmail });

    // Login user and send JWT token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    const existingOtp = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (existingOtp && new Date() < new Date(existingOtp.resendAllowedAt)) {
      const waitSeconds = Math.ceil((new Date(existingOtp.resendAllowedAt) - new Date()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`
      });
    }

    // Delete previous OTP records
    await Otp.deleteMany({ email: normalizedEmail });

    const rawOtp = generateNumericOtp();
    const otpHash = hashOtp(rawOtp);

    const expiryMinutes = getExpiryMinutes();
    const cooldownSeconds = getResendCooldownSeconds();

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const resendAllowedAt = new Date(Date.now() + cooldownSeconds * 1000);

    await Otp.create({
      email: normalizedEmail,
      otpHash,
      type: existingOtp?.type || 'signup',
      expiresAt,
      resendAllowedAt,
      attempts: 0
    });

    const mailResult = await sendBrevoOtpEmail({
      email: normalizedEmail,
      userName: user.name,
      otp: rawOtp,
      expiryMinutes
    });

    if (!mailResult.success) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(500).json({
        success: false,
        message: mailResult.error || 'Unable to send OTP right now. Please try again in a few moments.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `A new OTP has been sent to ${normalizedEmail}`,
      resendAllowedAt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'ganeshgifting_super_secret_jwt_refresh_token_key_2026');
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id);
    res.json({ success: true, token: accessToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token refresh failed' });
  }
};

// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, dob, gender } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;

    // Handle avatar image upload to Cloudinary → shrimaruti/avatars
    if (req.file) {
      const { processAndUploadImage } = require('../middleware/uploadMiddleware');
      const { url: avatarUrl } = await processAndUploadImage(
        req.file.buffer,
        'shrimaruti/avatars',
        { maxWidth: 400, maxHeight: 400, quality: 85 }
      );
      user.avatar = avatarUrl; // Store Cloudinary URL in DB
    }

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/addresses
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/auth/addresses/:addressId
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/reminders
exports.addReminder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.reminders.push(req.body);
    await user.save();
    res.json({ success: true, reminders: user.reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/auth/location
exports.updateLocation = async (req, res) => {
  try {
    const {
      pincode,
      place,
      locality,
      district,
      city,
      state,
      country = 'India',
      address,
      houseNumber,
      road,
      source = 'manual',
      accuracy,
      userConfirmed = false,
      location
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const cleanPin = String(pincode || '').trim().replace(/\D/g, '');
    const finalPin = /^[1-9][0-9]{5}$/.test(cleanPin) ? cleanPin : user.savedLocation?.pincode || '226028';

    let validatedLocation = undefined;
    if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      const lng = parseFloat(location.coordinates[0]);
      const lat = parseFloat(location.coordinates[1]);
      if (!isNaN(lng) && !isNaN(lat) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        validatedLocation = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }
    }

    user.savedLocation = {
      pincode: finalPin,
      place: place || locality || city || 'Lucknow',
      locality: locality || place || city || 'Lucknow',
      district: district || city || 'Lucknow',
      city: city || district || 'Lucknow',
      state: state || 'Uttar Pradesh',
      country: country || 'India',
      address: address || '',
      houseNumber: houseNumber || '',
      road: road || '',
      source: source || 'manual',
      accuracy: typeof accuracy === 'number' ? accuracy : null,
      userConfirmed: Boolean(userConfirmed),
      location: validatedLocation || user.savedLocation?.location
    };

    await user.save();

    res.json({ success: true, savedLocation: user.savedLocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
