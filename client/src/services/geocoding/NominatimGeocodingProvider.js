import { GeocodingProvider } from './GeocodingProvider.js';

/**
 * NominatimGeocodingProvider
 * OpenStreetMap Nominatim reverse geocoder implementing OSM usage policies:
 * - Throttles to at least 1000ms between requests
 * - Sends identifiable User-Agent
 * - Provides OpenStreetMap attribution
 * - Formats and sanitizes Indian address fields
 */
export class NominatimGeocodingProvider extends GeocodingProvider {
  constructor(options = {}) {
    super('Nominatim');
    this.baseUrl = options.baseUrl || 'https://nominatim.openstreetmap.org';
    this.userAgent = options.userAgent || 'ShriMarutiECommerce/1.0 (contact: support@shrimaruti.com)';
    this.lastRequestTimestamp = 0;
    this.minIntervalMs = 1050; // Respect >= 1s per request limit
  }

  /**
   * Simple promise-based rate limiter
   */
  async _waitForRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTimestamp;
    if (elapsed < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - elapsed;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTimestamp = Date.now();
  }

  /**
   * Reverse geocode coordinates to structured address
   * @param {number} latitude
   * @param {number} longitude
   */
  async reverseGeocode(latitude, longitude) {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Valid numeric latitude and longitude are required for reverse geocoding.');
    }

    await this._waitForRateLimit();

    const url = `${this.baseUrl}/reverse?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&format=jsonv2&addressdetails=1&zoom=18`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Nominatim API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data || !data.address) {
        throw new Error('No address details found for given coordinates');
      }

      return this._formatNominatimResponse(data, latitude, longitude);
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Normalize and map Nominatim address object to ShriMaruti format
   */
  _formatNominatimResponse(data, latitude, longitude) {
    const rawAddr = data.address || {};

    // 1. House Number / Building
    const houseNumber = rawAddr.house_number || rawAddr.building || rawAddr.house_name || rawAddr.apartment || '';

    // 2. Road / Street
    const road = rawAddr.road || rawAddr.street || rawAddr.footway || rawAddr.path || '';

    // 3. Locality / Neighbourhood
    const locality = rawAddr.suburb || rawAddr.neighbourhood || rawAddr.residential || rawAddr.subdistrict || rawAddr.quarter || '';
    const neighbourhood = rawAddr.neighbourhood || rawAddr.suburb || '';

    // 4. Village / Town / City
    const village = rawAddr.village || '';
    const town = rawAddr.town || '';
    const city = rawAddr.city || rawAddr.town || rawAddr.village || rawAddr.municipality || rawAddr.city_district || 'City Area';

    // 5. District
    const district = rawAddr.state_district || rawAddr.county || rawAddr.district || city || '';

    // 6. State & Country
    const state = rawAddr.state || 'Uttar Pradesh';
    const country = rawAddr.country || 'India';

    // 7. PIN Code Validation (Strict Indian 6-digit regex)
    let pincode = '';
    const rawPostcode = rawAddr.postcode ? String(rawAddr.postcode).trim() : '';
    if (/^[1-9][0-9]{5}$/.test(rawPostcode)) {
      pincode = rawPostcode;
    }

    // 8. Build formatted address string
    const addressParts = [
      houseNumber,
      road,
      locality,
      neighbourhood !== locality ? neighbourhood : '',
      village,
      town !== city ? town : '',
      city,
      district !== city ? district : '',
      state,
      pincode ? `PIN: ${pincode}` : '',
      country
    ].filter(Boolean);

    const fullAddress = data.display_name || addressParts.join(', ');

    return {
      fullAddress,
      houseNumber,
      road,
      locality: locality || neighbourhood || road || city,
      neighbourhood,
      village,
      town,
      city,
      district: district || city,
      state,
      country,
      pincode, // Note: If missing from OSM, this remains empty and will NOT be guessed
      latitude,
      longitude,
      attribution: '© OpenStreetMap contributors (ODbL)',
      raw: data
    };
  }

  /**
   * Geocode a place query or PIN code
   */
  async geocode(query) {
    await this._waitForRateLimit();

    const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}&countrycodes=in&format=jsonv2&addressdetails=1&limit=5`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      return list.map(item => this._formatNominatimResponse(item, parseFloat(item.lat), parseFloat(item.lon)));
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
