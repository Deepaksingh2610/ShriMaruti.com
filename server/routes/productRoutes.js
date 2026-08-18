const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, requireAdmin, upload.array('images', 8), createProduct);
router.put('/:id', protect, requireAdmin, upload.array('images', 8), updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

module.exports = router;
