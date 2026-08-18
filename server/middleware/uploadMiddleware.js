const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');
const Media = require('../models/Media');

// ── Allowed image MIME types ──────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'image/heic',
  'image/heif'
];

// ── Multer memory storage (no disk writes, buffers sent straight to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max per file
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, WebP, AVIF, GIF, HEIC).'), false);
    }
  }
});

/**
 * Generate a SHA-256 hash of a file buffer for content-based deduplication.
 * @param {Buffer} buffer
 * @returns {string} Hex hash string
 */
const generateImageHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Compress an image buffer with Sharp and stream it directly to Cloudinary
 * with SHA-256 image deduplication.
 *
 * If the exact same image content was uploaded before, it reuses the existing
 * Cloudinary URL and increments the reference count without making a duplicate
 * network upload to Cloudinary.
 *
 * @param {Buffer}  fileBuffer  - Raw multer file buffer
 * @param {string}  folder      - Cloudinary folder path  e.g. 'shrimaruti/products'
 * @param {object}  options     - Optional Sharp / Cloudinary overrides
 * @returns {Promise<{ url: string, publicId: string, hash: string, reused: boolean }>}
 */
const processAndUploadImage = async (
  fileBuffer,
  folder = 'shrimaruti/uploads',
  options = {}
) => {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error('A valid file buffer is required.');
  }

  // 1. Generate SHA-256 content fingerprint
  const rawHash = generateImageHash(fileBuffer);

  // 2. Check if this exact image was already uploaded (Deduplication)
  try {
    const existingMedia = await Media.findOne({ hash: rawHash });
    if (existingMedia && existingMedia.url) {
      // Increment reference counter
      existingMedia.refCount = (existingMedia.refCount || 0) + 1;
      await existingMedia.save();

      return {
        url: existingMedia.url,
        publicId: existingMedia.publicId || '',
        hash: existingMedia.hash,
        reused: true
      };
    }
  } catch (dbErr) {
    console.warn('[Deduplication Warning]: Media lookup failed, proceeding to upload.', dbErr.message);
  }

  const {
    maxWidth    = 1200,
    maxHeight   = 1200,
    quality     = 82,
    fit         = 'inside',
    format      = 'webp'
  } = options;

  // Fallback placeholder (used when Cloudinary is unreachable)
  const FALLBACK_URL = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop';

  try {
    // 3. Sharp image optimisation
    let processedBuffer = fileBuffer;
    let mimeType = 'image/webp';
    try {
      processedBuffer = await sharp(fileBuffer)
        .resize(maxWidth, maxHeight, { fit, withoutEnlargement: true })
        .toFormat(format, { quality })
        .toBuffer();
    } catch (_sharpErr) {
      // SVG / animated GIF / corrupt file → upload raw buffer
      processedBuffer = fileBuffer;
      mimeType = 'image/jpeg';
    }

    // 4. Stream directly to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          unique_filename: true,
          overwrite: false,
          tags: ['shrimaruti']
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]:', error.message || error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(processedBuffer);
    });

    const secureUrl = uploadResult.secure_url || uploadResult.url || FALLBACK_URL;
    const publicId = uploadResult.public_id || '';

    // 5. Store Media record for future deduplication & reference tracking
    try {
      await Media.create({
        hash: rawHash,
        url: secureUrl,
        publicId,
        folder,
        bytes: processedBuffer.length,
        mimeType,
        refCount: 1,
        tags: ['shrimaruti']
      });
    } catch (saveMediaErr) {
      // In case of race condition / unique hash conflict
      console.warn('[Media Save Warning]:', saveMediaErr.message);
    }

    return {
      url: secureUrl,
      publicId,
      hash: rawHash,
      reused: false
    };
  } catch (err) {
    console.error('[Image Processing & Upload Error]:', err.message);
    return {
      url: FALLBACK_URL,
      publicId: '',
      hash: rawHash,
      reused: false
    };
  }
};

/**
 * Safely delete an asset from Cloudinary when its reference count reaches 0.
 * @param {string} publicId - Cloudinary Public ID
 * @param {string} [hash] - Image SHA-256 hash
 */
const deleteCloudinaryAsset = async (publicId, hash) => {
  if (!publicId && !hash) return;

  try {
    const query = {};
    if (hash) query.hash = hash;
    else if (publicId) query.publicId = publicId;

    const media = await Media.findOne(query);
    if (media) {
      media.refCount = Math.max(0, (media.refCount || 1) - 1);
      if (media.refCount <= 0) {
        // Safe to destroy from Cloudinary since no other document references it
        if (media.publicId) {
          try {
            await cloudinary.uploader.destroy(media.publicId);
          } catch (destroyErr) {
            console.warn('[Cloudinary Destroy Warning]:', destroyErr.message);
          }
        }
        await Media.deleteOne({ _id: media._id });
        return { deleted: true, reason: 'Ref count 0; asset removed from Cloudinary' };
      } else {
        await media.save();
        return { deleted: false, reason: `Asset retained: referenced by ${media.refCount} other record(s)` };
      }
    } else if (publicId) {
      // If not tracked in Media collection, destroy directly if valid
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.warn('[Cloudinary Direct Destroy Warning]:', e.message);
      }
    }
  } catch (err) {
    console.warn('[Delete Asset Error]:', err.message);
  }
};

/**
 * Upload multiple files to Cloudinary in parallel with deduplication.
 * Returns an array of { url, publicId, hash, reused } objects.
 */
const uploadMultipleImages = async (files, folder = 'shrimaruti/products', options = {}) => {
  if (!files || !Array.isArray(files) || files.length === 0) return [];
  return Promise.all(files.map(f => processAndUploadImage(f.buffer, folder, options)));
};

/**
 * Convenience helper: returns only the URL strings (backwards-compatibility).
 */
const uploadMultipleImageUrls = async (files, folder, options) => {
  const results = await uploadMultipleImages(files, folder, options);
  return results.map(r => r.url);
};

module.exports = {
  upload,
  generateImageHash,
  processAndUploadImage,
  deleteCloudinaryAsset,
  uploadMultipleImages,
  uploadMultipleImageUrls
};
