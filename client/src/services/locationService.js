import { geocodingService } from './geocoding/index.js';
import API from './api.js';

// Cache keys & configuration
const GEOCODE_CACHE_KEY_PREFIX = 'sm_geocode_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const ACCURACY_LEVELS = {
  EXCELLENT: 'EXCELLENT',   // <= 30m
  GOOD: 'GOOD',             // 31m - 100m
  ACCEPTABLE: 'ACCEPTABLE', // 101m - 300m
  POOR: 'POOR',             // 301m - 1000m
  VERY_POOR: 'VERY_POOR'    // > 1000m
};

/**
 * Determine accuracy level classification based on meters reported by device GPS
 * @param {number} accuracyMeters
 */
export function getAccuracyLevel(accuracyMeters) {
  if (typeof accuracyMeters !== 'number' || accuracyMeters < 0) return ACCURACY_LEVELS.POOR;
  if (accuracyMeters <= 30) return ACCURACY_LEVELS.EXCELLENT;
  if (accuracyMeters <= 100) return ACCURACY_LEVELS.GOOD;
  if (accuracyMeters <= 300) return ACCURACY_LEVELS.ACCEPTABLE;
  if (accuracyMeters <= 1000) return ACCURACY_LEVELS.POOR;
  return ACCURACY_LEVELS.VERY_POOR;
}

/**
 * Calculate location confidence metadata for user display
 */
export function calculateLocationConfidence(accuracyMeters, hasPincode = false) {
  const level = getAccuracyLevel(accuracyMeters);
  const roundedAccuracy = Math.round(accuracyMeters || 0);

  switch (level) {
    case ACCURACY_LEVELS.EXCELLENT:
      return {
        level,
        label: 'High Precision GPS',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dotColor: 'bg-emerald-500',
        description: `Accurate within ~${roundedAccuracy}m (Street / Building level)`,
        isPrecise: true,
        allowOrderWithoutWarning: true
      };
    case ACCURACY_LEVELS.GOOD:
      return {
        level,
        label: 'Good Accuracy',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        dotColor: 'bg-teal-500',
        description: `Accurate within ~${roundedAccuracy}m (Locality level)`,
        isPrecise: true,
        allowOrderWithoutWarning: true
      };
    case ACCURACY_LEVELS.ACCEPTABLE:
      return {
        level,
        label: 'Approximate Area',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        dotColor: 'bg-amber-500',
        description: `Approx. within ~${roundedAccuracy}m. Please verify house & street number.`,
        isPrecise: false,
        allowOrderWithoutWarning: hasPincode
      };
    case ACCURACY_LEVELS.POOR:
      return {
        level,
        label: 'Low Accuracy',
        badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
        dotColor: 'bg-orange-500',
        description: `Device reported ~${roundedAccuracy}m accuracy. Confirming exact address is recommended.`,
        isPrecise: false,
        allowOrderWithoutWarning: false
      };
    case ACCURACY_LEVELS.VERY_POOR:
    default:
      return {
        level: ACCURACY_LEVELS.VERY_POOR,
        label: 'Very Low Accuracy',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        dotColor: 'bg-rose-500',
        description: 'Unable to determine precise GPS location. Please provide your PIN code or manual address.',
        isPrecise: false,
        allowOrderWithoutWarning: false
      };
  }
}

/**
 * Check browser geolocation permission status
 * Returns: 'granted' | 'prompt' | 'denied' | 'unsupported'
 */
export async function checkPermissionStatus() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'unsupported';
  }

  if (navigator.permissions && navigator.permissions.query) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state; // 'granted', 'prompt', 'denied'
    } catch (_err) {
      // Some browsers throw on querying geolocation
      return 'prompt';
    }
  }

  return 'prompt';
}

/**
 * Capture multiple GPS readings using watchPosition over a short duration
 * and return the reading with the best (lowest) accuracy.
 * Automatically stops watching once an excellent reading is obtained or duration expires.
 */
export function getBestLocationReading(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 0,
    watchDurationMs = 4000,
    targetAccuracyMeters = 30
  } = options;

  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    const readings = [];
    let watchId = null;
    let watchTimer = null;
    let fallbackTimeout = null;
    let resolved = false;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (watchTimer) {
        clearTimeout(watchTimer);
        watchTimer = null;
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
        fallbackTimeout = null;
      }
    };

    const finishWithBestReading = () => {
      if (resolved) return;
      resolved = true;
      cleanup();

      if (readings.length === 0) {
        return reject(new Error('Unable to acquire a valid GPS position.'));
      }

      // Sort by accuracy ascending (lowest meters = highest precision)
      readings.sort((a, b) => a.accuracy - b.accuracy);
      const best = readings[0];

      resolve({
        latitude: best.latitude,
        longitude: best.longitude,
        accuracy: best.accuracy,
        timestamp: best.timestamp,
        accuracyLevel: getAccuracyLevel(best.accuracy),
        readingsSampled: readings.length
      });
    };

    // First attempt: Fast single position query
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const record = { latitude, longitude, accuracy, timestamp: new Date(pos.timestamp || Date.now()) };
        readings.push(record);

        // If initial reading is already excellent (<= targetAccuracyMeters), return immediately
        if (accuracy <= targetAccuracyMeters) {
          resolved = true;
          cleanup();
          return resolve({
            latitude,
            longitude,
            accuracy,
            timestamp: record.timestamp,
            accuracyLevel: getAccuracyLevel(accuracy),
            readingsSampled: 1
          });
        }

        // If accuracy is sub-optimal, start watching briefly for improvement
        try {
          watchId = navigator.geolocation.watchPosition(
            (watchPos) => {
              const wCoords = watchPos.coords;
              const wRecord = {
                latitude: wCoords.latitude,
                longitude: wCoords.longitude,
                accuracy: wCoords.accuracy,
                timestamp: new Date(watchPos.timestamp || Date.now())
              };
              readings.push(wRecord);

              // If an excellent reading arrives during watching, resolve immediately
              if (wCoords.accuracy <= targetAccuracyMeters) {
                finishWithBestReading();
              }
            },
            (_watchErr) => {
              // Non-fatal, let timer finish with whatever readings we have
            },
            { enableHighAccuracy, timeout: 5000, maximumAge: 0 }
          );
        } catch (_wErr) {
          // Ignore watchPosition failure if browser prevents it
        }

        // Stop watching after watchDurationMs
        watchTimer = setTimeout(finishWithBestReading, watchDurationMs);
      },
      (err) => {
        cleanup();
        let userMessage = 'Unable to determine your precise location. Please try again or enter your PIN code manually.';
        if (err.code === 1) { // PERMISSION_DENIED
          userMessage = 'Location permission is disabled. Please allow location access in browser settings or enter your PIN code manually.';
        } else if (err.code === 3) { // TIMEOUT
          userMessage = 'Location detection timed out. Please check your GPS or enter your PIN code manually.';
        }
        const error = new Error(userMessage);
        error.code = err.code;
        reject(error);
      },
      { enableHighAccuracy, timeout, maximumAge }
    );

    // Global safety timeout
    fallbackTimeout = setTimeout(() => {
      if (!resolved) {
        if (readings.length > 0) {
          finishWithBestReading();
        } else {
          cleanup();
          reject(new Error('Location detection timed out. Please enter your PIN code manually.'));
        }
      }
    }, timeout + 2000);
  });
}

/**
 * Cached reverse geocoding
 * Converts latitude and longitude into structured address and PIN code
 */
export async function reverseGeocode(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Valid latitude and longitude are required for reverse geocoding.');
  }

  // Cache key rounded to 4 decimal places (~11 meters precision)
  const latKey = latitude.toFixed(4);
  const lonKey = longitude.toFixed(4);
  const cacheKey = `${GEOCODE_CACHE_KEY_PREFIX}${latKey}_${lonKey}`;

  // Check localStorage cache
  try {
    const cachedItemStr = localStorage.getItem(cacheKey);
    if (cachedItemStr) {
      const cached = JSON.parse(cachedItemStr);
      if (Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        return cached.data;
      }
      localStorage.removeItem(cacheKey);
    }
  } catch (_cErr) {
    // Ignore localStorage errors
  }

  // Call geocoding service abstraction
  const result = await geocodingService.reverseGeocode(latitude, longitude);

  // Save to cache
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: result,
      cachedAt: Date.now()
    }));
  } catch (_saveErr) {
    // If quota exceeded, silently clear older keys
  }

  return result;
}

/**
 * Validates Indian 6-digit PIN code and fetches postal details
 */
export async function validatePincode(pincode) {
  const cleanPin = String(pincode || '').trim().replace(/\D/g, '');

  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return {
      isValid: false,
      message: 'PIN code must be a valid 6-digit Indian postal code starting with digits 1-9.'
    };
  }

  try {
    // Query Indian Postal PIN API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const poList = data[0].PostOffice;
        const mainPO = poList.find(po => po.DeliveryStatus === 'Delivery') || poList[0];
        const places = Array.from(new Set(poList.map(po => po.Name.trim())));

        return {
          isValid: true,
          pincode: cleanPin,
          place: mainPO.Name || mainPO.District,
          district: mainPO.District || mainPO.Division,
          city: mainPO.District || mainPO.Block || 'Lucknow',
          state: mainPO.State || 'Uttar Pradesh',
          placesList: places,
          postOffices: poList
        };
      }
    }
  } catch (_apiErr) {
    // Fallback to secondary source
  }

  // Secondary fallback: Zippopotam
  try {
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 3500);
    const res2 = await fetch(`https://api.zippopotam.us/in/${cleanPin}`, { signal: controller2.signal });
    clearTimeout(timeoutId2);

    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && data2.places && data2.places.length > 0) {
        const pl = data2.places[0];
        return {
          isValid: true,
          pincode: cleanPin,
          place: pl['place name'] || 'Local Area',
          district: pl['state'] || 'District',
          city: pl['place name'] || 'City',
          state: pl['state'] || 'Uttar Pradesh',
          placesList: data2.places.map(p => p['place name'])
        };
      }
    }
  } catch (_zipErr) {
    // Ignore fallback failure
  }

  // Basic regex validity passed
  return {
    isValid: true,
    pincode: cleanPin,
    place: 'Local Area',
    district: 'District',
    city: 'City Area',
    state: 'Uttar Pradesh',
    placesList: []
  };
}

/**
 * Format address object into a clean readable string
 */
export function formatAddress(details = {}) {
  const parts = [
    details.houseNumber,
    details.road,
    details.locality,
    details.neighbourhood !== details.locality ? details.neighbourhood : '',
    details.city,
    details.district !== details.city ? details.district : '',
    details.state,
    details.pincode ? `PIN: ${details.pincode}` : '',
    details.country || 'India'
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * High-level orchestration function:
 * Detect GPS -> Evaluate accuracy -> Reverse geocode -> Structure result
 */
export async function detectCurrentLocation(options = {}) {
  // 1. Obtain best GPS reading
  const gps = await getBestLocationReading(options);

  // 2. Reverse geocode coordinates
  let geocodeData = null;
  let geocodeError = null;

  try {
    geocodeData = await reverseGeocode(gps.latitude, gps.longitude);
  } catch (err) {
    geocodeError = err.message;
  }

  const confidence = calculateLocationConfidence(gps.accuracy, Boolean(geocodeData?.pincode));

  return {
    latitude: gps.latitude,
    longitude: gps.longitude,
    accuracy: gps.accuracy,
    accuracyLevel: gps.accuracyLevel,
    confidence,
    timestamp: gps.timestamp,
    readingsSampled: gps.readingsSampled,
    address: geocodeData?.fullAddress || '',
    houseNumber: geocodeData?.houseNumber || '',
    road: geocodeData?.road || '',
    locality: geocodeData?.locality || '',
    neighbourhood: geocodeData?.neighbourhood || '',
    village: geocodeData?.village || '',
    town: geocodeData?.town || '',
    city: geocodeData?.city || '',
    district: geocodeData?.district || '',
    state: geocodeData?.state || 'Uttar Pradesh',
    country: geocodeData?.country || 'India',
    pincode: geocodeData?.pincode || '',
    attribution: geocodeData?.attribution || '© OpenStreetMap contributors',
    source: 'browser-gps',
    userConfirmed: false,
    geocodeError
  };
}

/**
 * Save user location to database if logged in
 */
export async function saveUserLocation(locationData, isUserLoggedIn = false) {
  if (isUserLoggedIn) {
    try {
      const payload = {
        pincode: locationData.pincode,
        place: locationData.locality || locationData.place || locationData.city,
        district: locationData.district || locationData.city,
        city: locationData.city,
        state: locationData.state,
        houseNumber: locationData.houseNumber || '',
        road: locationData.road || '',
        locality: locationData.locality || '',
        source: locationData.source || 'browser-gps',
        accuracy: locationData.accuracy || null,
        userConfirmed: locationData.userConfirmed || false,
        location: locationData.latitude && locationData.longitude ? {
          type: 'Point',
          coordinates: [Number(locationData.longitude), Number(locationData.latitude)]
        } : undefined
      };

      const res = await API.put('/auth/location', payload);
      return res.data;
    } catch (err) {
      console.warn('[Location Sync Failed]:', err.message);
    }
  }
  return null;
}
