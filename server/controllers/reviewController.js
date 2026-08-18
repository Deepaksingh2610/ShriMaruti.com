const Review = require('../models/Review');
const Product = require('../models/Product');

// @route GET /api/reviews/product/:productId
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/reviews
// Supports optional photo uploads (field name: "photos", up to 5 images)
// Uploaded photos are stored on Cloudinary → shrimaruti/reviews
exports.addReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    // Upload any attached review photos to Cloudinary
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      const { uploadMultipleImageUrls } = require('../middleware/uploadMiddleware');
      photoUrls = await uploadMultipleImageUrls(req.files, 'shrimaruti/reviews', {
        maxWidth: 800,
        maxHeight: 800,
        quality: 80
      });
    }

    const review = await Review.create({
      product,
      user: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
      photos: photoUrls,          // Cloudinary URLs stored in DB
      isVerifiedPurchase: true
    });

    // Recalculate product average rating
    const reviews = await Review.find({ product, isApproved: true });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await Product.findByIdAndUpdate(product, {
      rating: Number(avgRating.toFixed(1)),
      numReviews: reviews.length
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
