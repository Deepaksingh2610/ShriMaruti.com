const Store = require('../models/Store');
const User = require('../models/User');

// In-memory cache for server-side reverse geocoding fallback
const serverGeocodeCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Validate 6-digit Indian PIN Code
 * @route POST /api/location/validate-pincode
 */
exports.validatePincode = async (req, res) => {
  try {
    const { pincode } = req.body;
    const cleanPin = String(pincode || '').trim().replace(/\D/g, '');

    // Strictly validate 6 digits starting with 1-9
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      return res.status(400).json({
        success: false,
        isValid: false,
        message: 'PIN code must be a valid 6-digit Indian postal code starting with digits 1-9.'
      });
    }

    // Check if any active store serves this PIN code directly
    const matchingStores = await Store.find({
      isActive: true,
      servicePincodes: cleanPin
    }).select('name code city deliveryRadiusKm phone');

    res.json({
      success: true,
      isValid: true,
      pincode: cleanPin,
      isDeliverable: true,
      serviceStores: matchingStores
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Find Nearby Stores / Fulfillment Hubs using MongoDB 2dsphere $near
 * @route GET /api/location/nearby-stores
 */
exports.getNearbyStores = async (req, res) => {
  try {
    const { lat, lng, radius = 50, pincode } = req.query;

    const numericLat = parseFloat(lat);
    const numericLng = parseFloat(lng);
    const radiusKm = Math.min(Math.max(parseFloat(radius) || 50, 1), 200);

    // Validate coordinates
    if (isNaN(numericLat) || isNaN(numericLng) || numericLat < -90 || numericLat > 90 || numericLng < -180 || numericLng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Valid numeric latitude (-90 to 90) and longitude (-180 to 180) are required.'
      });
    }

    // Convert km to meters for MongoDB $maxDistance
    const maxDistanceMeters = radiusKm * 1000;

    // MongoDB 2dsphere geospatial $near query (coordinates format: [lng, lat])
    const nearbyStores = await Store.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [numericLng, numericLat]
          },
          $maxDistance: maxDistanceMeters
        }
      }
    }).limit(10);

    // Calculate approximate aerial distance in km
    const storesWithDistance = nearbyStores.map(store => {
      const storeLng = store.location.coordinates[0];
      const storeLat = store.location.coordinates[1];

      // Haversine formula
      const R = 6371; // Earth radius in km
      const dLat = ((storeLat - numericLat) * Math.PI) / 180;
      const dLon = ((storeLng - numericLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((numericLat * Math.PI) / 180) *
        Math.cos((storeLat * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = Math.round(R * c * 10) / 10;

      const isWithinDeliveryZone = distanceKm <= store.deliveryRadiusKm || (pincode && store.servicePincodes.includes(pincode));

      return {
        ...store.toObject(),
        distanceKm,
        isWithinDeliveryZone
      };
    });

    res.json({
      success: true,
      count: storesWithDistance.length,
      searchCoordinates: { latitude: numericLat, longitude: numericLng },
      radiusKm,
      stores: storesWithDistance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Server-side Cached Fallback Reverse Geocoding
 * @route POST /api/location/reverse-geocode
 */
exports.reverseGeocodeProxy = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ success: false, message: 'Valid latitude and longitude required.' });
    }

    const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
    const cached = serverGeocodeCache.get(cacheKey);

    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return res.json({ success: true, fromCache: true, data: cached.data });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1&zoom=18`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const nominatimRes = await fetch(url, {
      headers: {
        'User-Agent': 'ShriMarutiECommerce/1.0 (server-proxy; contact: support@shrimaruti.com)',
        'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!nominatimRes.ok) {
      throw new Error(`Nominatim returned HTTP ${nominatimRes.status}`);
    }

    const rawData = await nominatimRes.json();
    const rawAddr = rawData.address || {};

    const pincode = /^[1-9][0-9]{5}$/.test(rawAddr.postcode) ? rawAddr.postcode : '';
    const locality = rawAddr.suburb || rawAddr.neighbourhood || rawAddr.residential || rawAddr.city_district || '';
    const city = rawAddr.city || rawAddr.town || rawAddr.village || 'City Area';
    const district = rawAddr.state_district || rawAddr.county || city;
    const state = rawAddr.state || 'Uttar Pradesh';

    const formattedData = {
      fullAddress: rawData.display_name || '',
      houseNumber: rawAddr.house_number || rawAddr.building || '',
      road: rawAddr.road || '',
      locality: locality || city,
      city,
      district,
      state,
      country: rawAddr.country || 'India',
      pincode,
      latitude: lat,
      longitude: lon,
      attribution: '© OpenStreetMap contributors'
    };

    serverGeocodeCache.set(cacheKey, { data: formattedData, cachedAt: Date.now() });

    res.json({ success: true, fromCache: false, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Seed initial fulfillment hubs/stores across India
 * @route POST /api/location/seed-stores
 */
exports.seedStores = async (req, res) => {
  try {
    const existingCount = await Store.countDocuments();
    if (existingCount > 0) {
      const stores = await Store.find().sort({ createdAt: -1 });
      return res.json({ success: true, message: 'Stores already seeded.', count: stores.length, stores });
    }

    const defaultStores = [
      {
        name: 'Shri Maruti Flagship Store - Lucknow',
        code: 'SM-LKO-01',
        storeType: 'flagship',
        address: 'Plot 12, Sector 14, Faizabad Road, Indira Nagar',
        locality: 'Indira Nagar',
        city: 'Lucknow',
        district: 'Lucknow',
        state: 'Uttar Pradesh',
        pincode: '226028',
        phone: '+91 9876543210',
        email: 'lucknow.hub@shrimaruti.com',
        deliveryRadiusKm: 35,
        servicePincodes: ['226028', '226016', '226010', '226001', '226024', '226020', '226006'],
        location: {
          type: 'Point',
          coordinates: [80.9980, 26.8850] // [lng, lat] Lucknow Indira Nagar
        }
      },
      {
        name: 'Shri Maruti Hub - Noida & Delhi NCR',
        code: 'SM-NOIDA-01',
        storeType: 'hub',
        address: 'B-12, Sector 62, Electronic City',
        locality: 'Sector 62',
        city: 'Noida',
        district: 'Gautam Buddha Nagar',
        state: 'Uttar Pradesh',
        pincode: '201309',
        phone: '+91 9876543211',
        email: 'noida.hub@shrimaruti.com',
        deliveryRadiusKm: 40,
        servicePincodes: ['201309', '201301', '201307', '110091', '110092', '110096'],
        location: {
          type: 'Point',
          coordinates: [77.3639, 28.6280] // [lng, lat] Noida Sector 62
        }
      },
      {
        name: 'Shri Maruti Hub - Kanpur Central',
        code: 'SM-KNP-01',
        storeType: 'hub',
        address: '45, Civil Lines, Mall Road',
        locality: 'Civil Lines',
        city: 'Kanpur',
        district: 'Kanpur Nagar',
        state: 'Uttar Pradesh',
        pincode: '208001',
        phone: '+91 9876543212',
        email: 'kanpur.hub@shrimaruti.com',
        deliveryRadiusKm: 30,
        servicePincodes: ['208001', '208002', '208005', '208012'],
        location: {
          type: 'Point',
          coordinates: [80.3498, 26.4725] // [lng, lat] Kanpur Civil Lines
        }
      },
      {
        name: 'Shri Maruti Hub - Varanasi City',
        code: 'SM-VNS-01',
        storeType: 'hub',
        address: 'G-4, Sigra Main Road',
        locality: 'Sigra',
        city: 'Varanasi',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221002',
        phone: '+91 9876543213',
        email: 'varanasi.hub@shrimaruti.com',
        deliveryRadiusKm: 25,
        servicePincodes: ['221002', '221001', '221005', '221010'],
        location: {
          type: 'Point',
          coordinates: [82.9863, 25.3176] // [lng, lat] Varanasi Sigra
        }
      }
    ];

    const created = await Store.insertMany(defaultStores);
    res.status(201).json({
      success: true,
      message: 'Default fulfillment stores seeded successfully.',
      count: created.length,
      stores: created
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
