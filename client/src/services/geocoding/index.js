import { NominatimGeocodingProvider } from './NominatimGeocodingProvider.js';

class GeocodingService {
  constructor() {
    this.providers = new Map();
    // Register default Nominatim provider
    const defaultProvider = new NominatimGeocodingProvider();
    this.registerProvider('nominatim', defaultProvider);
    this.activeProviderName = 'nominatim';
  }

  registerProvider(name, providerInstance) {
    this.providers.set(name.toLowerCase(), providerInstance);
  }

  setProvider(name) {
    const key = name.toLowerCase();
    if (!this.providers.has(key)) {
      throw new Error(`Geocoding provider '${name}' is not registered.`);
    }
    this.activeProviderName = key;
  }

  getProvider(name) {
    if (name) {
      return this.providers.get(name.toLowerCase());
    }
    return this.providers.get(this.activeProviderName);
  }

  async reverseGeocode(latitude, longitude, providerName) {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error('No active geocoding provider available.');
    }
    return await provider.reverseGeocode(latitude, longitude);
  }

  async geocode(query, providerName) {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error('No active geocoding provider available.');
    }
    return await provider.geocode(query);
  }
}

export const geocodingService = new GeocodingService();
export { GeocodingProvider } from './GeocodingProvider.js';
export { NominatimGeocodingProvider } from './NominatimGeocodingProvider.js';
