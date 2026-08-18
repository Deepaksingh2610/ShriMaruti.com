const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('slugify');
const {
  processAndUploadImage,
  uploadMultipleImages,
  deleteCloudinaryAsset
} = require('../middleware/uploadMiddleware');
const { getCache, setCache, clearCache, isDbConnected } = require('../utils/cache');
const { fallbackProducts } = require('../utils/fallbackData');

// @route GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, isBestseller, isTrending, page = 1, limit = 20 } = req.query;

    const cacheKey = `products:${category || ''}:${search || ''}:${minPrice || ''}:${maxPrice || ''}:${sort || ''}:${isBestseller || ''}:${isTrending || ''}:${page}:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, source: 'cache' });
    }

    if (!isDbConnected()) {
      let filtered = [...fallbackProducts];
      if (isBestseller === 'true') filtered = filtered.filter(p => p.isBestseller);
      if (isTrending === 'true') filtered = filtered.filter(p => p.isTrending);
      if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      return res.json({ success: true, count: filtered.length, page: 1, pages: 1, products: filtered, source: 'fallback' });
    }

    const query = {};

    if (category) {
      const catDoc = await Category.findOne({ slug: category }).lean();
      if (catDoc) query.category = catDoc._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (isBestseller === 'true') query.isBestseller = true;
    if (isTrending === 'true') query.isTrending = true;

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'popularity') sortOptions = { numReviews: -1, rating: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [count, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean()
    ]);

    const payload = {
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      products
    };

    if (!search && !minPrice && !maxPrice) {
      setCache(cacheKey, payload, 60);
    }

    res.json(payload);
  } catch (error) {
    console.warn('[Products Warning]: DB query failed, returning fallback data.', error.message);
    res.json({ success: true, count: fallbackProducts.length, page: 1, pages: 1, products: fallbackProducts, source: 'fallback' });
  }
};

// @route GET /api/products/:slug
exports.getProductBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const cacheKey = `product:${slug}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, source: 'cache' });
    }

    if (!isDbConnected()) {
      const fallback = fallbackProducts.find(p => p.slug === slug);
      if (fallback) return res.json({ success: true, product: fallback, relatedProducts: [], source: 'fallback' });
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = await Product.findOne({ slug }).populate('category', 'name slug').lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id }
    }).limit(6).lean();

    const payload = { success: true, product, relatedProducts };
    setCache(cacheKey, payload, 60);
    res.json(payload);
  } catch (error) {
    console.warn('[ProductBySlug Warning]: DB query failed.', error.message);
    res.status(500).json({ success: false, message: 'Unable to fetch product details. Please try again.' });
  }
};

// @route POST /api/products (Admin Only)
exports.createProduct = async (req, res) => {
  let uploadedResults = [];
  try {
    const {
      name, categoryId, price, originalPrice, stock, description, whyBuy,
      isBestseller, isTrending, isLuxe, variants, metaTitle, metaDescription,
      policyType, returnPolicyDays, policyTerms
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Product category is required' });
    }
    if (price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'A valid price is required' });
    }

    const categoryObj = await Category.findById(categoryId);
    if (!categoryObj) {
      return res.status(400).json({ success: false, message: 'Selected category does not exist' });
    }

    const validatedDays = Math.min(7, Math.max(0, Number(returnPolicyDays) || 0));

    // Generate unique slug
    let baseSlug = slugify(name, { lower: true, strict: true }) || 'product';
    let slug = baseSlug;
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    let imageUrls = [];
    let imagePublicIds = [];
    let imageHashes = [];

    // 1. Handle file uploads with deduplication
    if (req.files && req.files.length > 0) {
      uploadedResults = await uploadMultipleImages(req.files, 'shrimaruti/products');
      imageUrls = uploadedResults.map(r => r.url);
      imagePublicIds = uploadedResults.map(r => r.publicId);
      imageHashes = uploadedResults.map(r => r.hash);
    } else if (req.body.imageUrls || req.body.images) {
      const rawUrls = req.body.imageUrls || req.body.images;
      if (Array.isArray(rawUrls)) {
        imageUrls = rawUrls;
      } else if (typeof rawUrls === 'string') {
        try {
          const parsed = JSON.parse(rawUrls);
          imageUrls = Array.isArray(parsed) ? parsed : [parsed];
        } catch (_e) {
          imageUrls = [rawUrls];
        }
      }
    }

    if (imageUrls.length === 0) {
      imageUrls = ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop'];
    }

    const product = await Product.create({
      name: name.trim(),
      slug,
      category: categoryId,
      categoryName: categoryObj.name,
      price: Math.max(0, Number(price) || 0),
      originalPrice: Math.max(0, Number(originalPrice || price) || 0),
      stock: Math.max(0, Number(stock) || 0),
      images: imageUrls,
      imagePublicIds,
      imageHashes,
      description: description || name,
      whyBuy: whyBuy ? (Array.isArray(whyBuy) ? whyBuy : whyBuy.split('\n')) : [],
      isBestseller: isBestseller === 'true' || isBestseller === true,
      isTrending: isTrending === 'true' || isTrending === true,
      isLuxe: isLuxe === 'true' || isLuxe === true,
      variants: variants ? (typeof variants === 'string' ? JSON.parse(variants) : variants) : [],
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || description,
      policyType: policyType || 'Return',
      returnPolicyDays: validatedDays,
      policyTerms: policyTerms || 'Product can be returned or refunded within valid days if undamaged with original packaging.'
    });

    clearCache('products:');

    res.status(201).json({ success: true, product });
  } catch (error) {
    // If DB insert failed, clean up any newly uploaded images to avoid orphans
    if (uploadedResults.length > 0) {
      for (const resItem of uploadedResults) {
        if (!resItem.reused && resItem.publicId) {
          await deleteCloudinaryAsset(resItem.publicId, resItem.hash);
        }
      }
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/products/:id (Admin Only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const oldSlug = product.slug;

    // Update simple fields
    if (req.body.name && req.body.name.trim() !== product.name) {
      product.name = req.body.name.trim();
      let baseSlug = slugify(product.name, { lower: true, strict: true }) || 'product';
      let slug = baseSlug;
      const existingSlug = await Product.findOne({ slug, _id: { $ne: product._id } });
      if (existingSlug) {
        slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }
      product.slug = slug;
    }

    if (req.body.categoryId && req.body.categoryId.toString() !== (product.category?.toString() || '')) {
      const categoryObj = await Category.findById(req.body.categoryId);
      if (categoryObj) {
        product.category = categoryObj._id;
        product.categoryName = categoryObj.name;
      }
    }

    if (req.body.price !== undefined) product.price = Math.max(0, Number(req.body.price) || 0);
    if (req.body.originalPrice !== undefined) product.originalPrice = Math.max(0, Number(req.body.originalPrice) || 0);
    if (req.body.stock !== undefined) product.stock = Math.max(0, Number(req.body.stock) || 0);
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.policyType !== undefined) product.policyType = req.body.policyType;
    if (req.body.policyTerms !== undefined) product.policyTerms = req.body.policyTerms;
    if (req.body.returnPolicyDays !== undefined) {
      product.returnPolicyDays = Math.min(7, Math.max(0, Number(req.body.returnPolicyDays) || 0));
    }
    if (req.body.isBestseller !== undefined) {
      product.isBestseller = req.body.isBestseller === 'true' || req.body.isBestseller === true;
    }
    if (req.body.isTrending !== undefined) {
      product.isTrending = req.body.isTrending === 'true' || req.body.isTrending === true;
    }

    // Handle image updates
    if (req.files && req.files.length > 0) {
      const newUploads = await uploadMultipleImages(req.files, 'shrimaruti/products');
      const newUrls = newUploads.map(r => r.url);
      const newPublicIds = newUploads.map(r => r.publicId);
      const newHashes = newUploads.map(r => r.hash);

      if (req.body.replaceImages === 'true' || !product.images || product.images.length === 0) {
        // Clean up old assets safely if being replaced
        if (product.imagePublicIds && product.imagePublicIds.length > 0) {
          for (let i = 0; i < product.imagePublicIds.length; i++) {
            await deleteCloudinaryAsset(product.imagePublicIds[i], product.imageHashes?.[i]);
          }
        }
        product.images = newUrls;
        product.imagePublicIds = newPublicIds;
        product.imageHashes = newHashes;
      } else {
        product.images = [...(product.images || []), ...newUrls];
        product.imagePublicIds = [...(product.imagePublicIds || []), ...newPublicIds];
        product.imageHashes = [...(product.imageHashes || []), ...newHashes];
      }
    } else if (req.body.images) {
      let passedImages = [];
      if (Array.isArray(req.body.images)) {
        passedImages = req.body.images;
      } else if (typeof req.body.images === 'string') {
        try {
          const parsed = JSON.parse(req.body.images);
          passedImages = Array.isArray(parsed) ? parsed : [parsed];
        } catch (_e) {
          passedImages = [req.body.images];
        }
      }
      if (passedImages.length > 0) {
        product.images = passedImages;
      }
    }

    await product.save();

    clearCache('products:');
    clearCache(`product:${oldSlug}`);
    clearCache(`product:${product.slug}`);

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/products/:id (Admin Only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Safely dereference Cloudinary assets
    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      for (let i = 0; i < product.imagePublicIds.length; i++) {
        await deleteCloudinaryAsset(product.imagePublicIds[i], product.imageHashes?.[i]);
      }
    }

    await Product.deleteOne({ _id: product._id });

    clearCache('products:');
    clearCache(`product:${product.slug}`);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
