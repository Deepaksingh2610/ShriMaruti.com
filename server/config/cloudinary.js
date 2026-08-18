const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(
  process.env.CLOUDINARY_URL ||
  (cloudName && apiKey && apiSecret &&
   cloudName !== 'sample_cloud' &&
   apiKey !== '123456789012345' &&
   apiSecret !== 'sample_cloudinary_secret')
);

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
  console.log('[Cloudinary] Configured via CLOUDINARY_URL');
} else {
  cloudinary.config({
    cloud_name: cloudName || 'demo',
    api_key: apiKey || '1234567890',
    api_secret: apiSecret || 'sample_secret',
    secure: true
  });

  if (isConfigured) {
    console.log(`[Cloudinary] Successfully configured for cloud: ${cloudName}`);
  } else {
    console.warn('[Cloudinary] Running with placeholder/demo credentials. Replace CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env with your real Cloudinary credentials for live cloud storage.');
  }
}

cloudinary.isConfigured = isConfigured;

module.exports = cloudinary;
