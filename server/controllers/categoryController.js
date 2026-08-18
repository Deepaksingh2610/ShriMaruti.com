const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('slugify');
const { processAndUploadImage, deleteCloudinaryAsset } = require('../middleware/uploadMiddleware');
const { getCache, setCache, clearCache, isDbConnected } = require('../utils/cache');
const { fallbackCategories } = require('../utils/fallbackData');

// @route GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const cached = getCache('categories');
    if (cached) {
      return res.json({ success: true, count: cached.length, categories: cached, source: 'cache' });
    }

    if (isDbConnected()) {
      const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();
      if (categories && categories.length > 0) {
        setCache('categories', categories, 120);
        return res.json({ success: true, count: categories.length, categories });
      }
    }

    res.json({ success: true, count: fallbackCategories.length, categories: fallbackCategories, source: 'fallback' });
  } catch (error) {
    console.warn('[Categories Warning]: DB query failed, returning fallback data.', error.message);
    res.json({ success: true, count: fallbackCategories.length, categories: fallbackCategories, source: 'fallback' });
  }
};

// @route POST /api/categories (Admin Only)
exports.createCategory = async (req, res) => {
  let uploadedMedia = null;
  try {
    const { name, description, displayOrder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName, { lower: true, strict: true });

    // Check for duplicate category name or slug
    const existing = await Category.findOne({
      $or: [{ name: new RegExp(`^${trimmedName}$`, 'i') }, { slug }]
    });
    if (existing) {
      return res.status(400).json({ success: false, message: `Category "${trimmedName}" already exists` });
    }

    // Default placeholder image
    let image = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop';
    let imagePublicId = '';
    let imageHash = '';

    if (req.file) {
      // Upload to Cloudinary with deduplication
      uploadedMedia = await processAndUploadImage(req.file.buffer, 'shrimaruti/categories', {
        maxWidth: 600,
        maxHeight: 600,
        quality: 85
      });
      image = uploadedMedia.url;
      imagePublicId = uploadedMedia.publicId;
      imageHash = uploadedMedia.hash;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const category = await Category.create({
      name: trimmedName,
      slug,
      description: description || '',
      image,
      imagePublicId,
      imageHash,
      displayOrder: Number(displayOrder || 0)
    });

    clearCache('categories');

    res.status(201).json({ success: true, category });
  } catch (error) {
    if (uploadedMedia && !uploadedMedia.reused && uploadedMedia.publicId) {
      await deleteCloudinaryAsset(uploadedMedia.publicId, uploadedMedia.hash);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/categories/:id (Admin Only)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    if (req.body.name && req.body.name.trim() !== category.name) {
      const trimmedName = req.body.name.trim();
      const slug = slugify(trimmedName, { lower: true, strict: true });
      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        $or: [{ name: new RegExp(`^${trimmedName}$`, 'i') }, { slug }]
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Category "${trimmedName}" already exists` });
      }
      category.name = trimmedName;
      category.slug = slug;
    }

    if (req.body.description !== undefined) category.description = req.body.description;
    if (req.body.displayOrder !== undefined) category.displayOrder = Number(req.body.displayOrder);

    if (req.file) {
      // Clean up old image if replacing
      if (category.imagePublicId) {
        await deleteCloudinaryAsset(category.imagePublicId, category.imageHash);
      }
      // Upload new image with deduplication
      const result = await processAndUploadImage(req.file.buffer, 'shrimaruti/categories', {
        maxWidth: 600,
        maxHeight: 600,
        quality: 85
      });
      category.image = result.url;
      category.imagePublicId = result.publicId;
      category.imageHash = result.hash;
    } else if (req.body.image) {
      category.image = req.body.image;
    }

    await category.save();

    clearCache('categories');

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/categories/:id (Admin Only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    // SAFETY CHECK: Prevent deletion if active products are assigned to this category
    const attachedProductsCount = await Product.countDocuments({ category: category._id });
    if (attachedProductsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}": It has ${attachedProductsCount} active product(s) assigned to it. Please reassign or delete the products first.`
      });
    }

    // Clean up image asset safely
    if (category.imagePublicId) {
      await deleteCloudinaryAsset(category.imagePublicId, category.imageHash);
    }

    await Category.deleteOne({ _id: category._id });

    clearCache('categories');

    res.json({ success: true, message: `Category "${category.name}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
