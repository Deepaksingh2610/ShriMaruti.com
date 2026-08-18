const express = require('express');
const router = express.Router();
const { purchaseGiftCard, validateGiftCard } = require('../controllers/giftCardController');

router.post('/purchase', purchaseGiftCard);
router.post('/validate', validateGiftCard);

module.exports = router;
