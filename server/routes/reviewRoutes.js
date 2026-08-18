const express = require('express');
const router = express.Router();
const { getProductReviews, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/product/:productId', getProductReviews);
// photos field accepts up to 5 images — stored on Cloudinary
router.post('/', protect, upload.array('photos', 5), addReview);

module.exports = router;
