/**
 * GeocodingProvider - Base abstract interface for reverse geocoding providers.
 * Allows ShriMaruti.com to switch or chain providers (Nominatim, Photon, custom, etc.)
 * without altering application code.
 */
export class GeocodingProvider {
  constructor(name) {
    if (this.constructor === GeocodingProvider) {
      throw new Error('GeocodingProvider is an abstract class and cannot be instantiated directly.');
    }
    this.name = name || 'GenericProvider';
  }

  /**
   * Reverse geocodes latitude and longitude into a structured location address.
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<{
   *   fullAddress: string,
   *   houseNumber?: string,
   *   road?: string,
   *   locality?: string,
   *   neighbourhood?: string,
   *   village?: string,
   *   town?: string,
   *   city?: string,
   *   district?: string,
   *   state?: string,
   *   country?: string,
   *   pincode?: string,
   *   raw?: any,
   *   attribution?: string
   * }>}
   */
  async reverseGeocode(latitude, longitude) {
    throw new Error('reverseGeocode() must be implemented by subclass.');
  }

  /**
   * Geocodes an address or PIN code into coordinates if supported.
   * @param {string} query
   */
  async geocode(query) {
    throw new Error('geocode() must be implemented by subclass.');
  }
}
