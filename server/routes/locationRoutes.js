const express = require('express');
const router = express.Router();
const {
  validatePincode,
  getNearbyStores,
  reverseGeocodeProxy,
  seedStores
} = require('../controllers/locationController');

// Location validation and query routes
router.post('/validate-pincode', validatePincode);
router.get('/nearby-stores', getNearbyStores);
router.post('/reverse-geocode', reverseGeocodeProxy);
router.post('/seed-stores', seedStores);

module.exports = router;
