import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../services/api';

export const useLocationStore = create(
  persist(
    (set, get) => ({
      deliveryPincode: '226028',
      deliveryPlace: 'Indira Nagar',
      deliveryDistrict: 'Lucknow',
      deliveryCity: 'Lucknow',
      deliveryState: 'Uttar Pradesh',
      deliveryCountry: 'India',
      deliveryAddress: '',
      deliveryHouseNumber: '',
      deliveryRoad: '',
      latitude: 26.8850,
      longitude: 80.9980,
      accuracy: 25,
      accuracyLevel: 'EXCELLENT',
      source: 'default',
      userConfirmed: false,
      isModalOpen: false,

      setLocation: async (locationPayload, isUserLoggedIn = false) => {
        const {
          pincode = '226028',
          place,
          locality,
          district,
          city,
          state,
          country = 'India',
          address = '',
          houseNumber = '',
          road = '',
          latitude,
          longitude,
          accuracy = null,
          accuracyLevel = null,
          source = 'manual',
          userConfirmed = true
        } = locationPayload;

        const finalPlace = locality || place || city || 'Lucknow';
        const finalDistrict = district || city || 'Lucknow';
        const finalCity = city || district || 'Lucknow';
        const finalState = state || 'Uttar Pradesh';
        const finalPincode = pincode || '226028';

        set({
          deliveryPincode: finalPincode,
          deliveryPlace: finalPlace,
          deliveryDistrict: finalDistrict,
          deliveryCity: finalCity,
          deliveryState: finalState,
          deliveryCountry: country,
          deliveryAddress: address,
          deliveryHouseNumber: houseNumber,
          deliveryRoad: road,
          latitude: typeof latitude === 'number' ? latitude : get().latitude,
          longitude: typeof longitude === 'number' ? longitude : get().longitude,
          accuracy,
          accuracyLevel,
          source,
          userConfirmed,
          isModalOpen: false
        });

        // Save directly to MongoDB database if user is logged in
        if (isUserLoggedIn) {
          try {
            await API.put('/auth/location', {
              pincode: finalPincode,
              place: finalPlace,
              district: finalDistrict,
              city: finalCity,
              state: finalState,
              houseNumber,
              road,
              locality: finalPlace,
              source,
              accuracy,
              userConfirmed,
              location: typeof latitude === 'number' && typeof longitude === 'number' ? {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)]
              } : undefined
            });
          } catch (err) {
            console.warn('[MongoDB Sync] Location save failed:', err.message);
          }
        }
      },

      syncLocationFromUser: (user) => {
        if (!user) return;
        if (user.savedLocation && user.savedLocation.pincode) {
          const loc = user.savedLocation;
          set({
            deliveryPincode: loc.pincode,
            deliveryPlace: loc.locality || loc.place || loc.city,
            deliveryDistrict: loc.district || loc.city,
            deliveryCity: loc.city || loc.district,
            deliveryState: loc.state || 'Uttar Pradesh',
            deliveryAddress: loc.address || '',
            deliveryHouseNumber: loc.houseNumber || '',
            deliveryRoad: loc.road || '',
            latitude: loc.location?.coordinates ? loc.location.coordinates[1] : get().latitude,
            longitude: loc.location?.coordinates ? loc.location.coordinates[0] : get().longitude,
            accuracy: loc.accuracy || null,
            source: loc.source || 'account',
            userConfirmed: loc.userConfirmed || false
          });
        } else if (user.addresses && user.addresses.length > 0) {
          const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
          set({
            deliveryPincode: defaultAddr.pincode,
            deliveryPlace: defaultAddr.place || defaultAddr.city,
            deliveryDistrict: defaultAddr.district || defaultAddr.city,
            deliveryCity: defaultAddr.city,
            deliveryState: defaultAddr.state,
            deliveryAddress: defaultAddr.street,
            deliveryHouseNumber: defaultAddr.houseNumber || '',
            deliveryRoad: defaultAddr.road || defaultAddr.street || '',
            latitude: defaultAddr.location?.coordinates ? defaultAddr.location.coordinates[1] : get().latitude,
            longitude: defaultAddr.location?.coordinates ? defaultAddr.location.coordinates[0] : get().longitude,
            accuracy: defaultAddr.accuracy || null,
            source: defaultAddr.source || 'saved-address',
            userConfirmed: true
          });
        }
      },

      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false })
    }),
    {
      name: 'shrimaruti_delivery_location',
      partialize: (state) => ({
        deliveryPincode: state.deliveryPincode,
        deliveryPlace: state.deliveryPlace,
        deliveryDistrict: state.deliveryDistrict,
        deliveryCity: state.deliveryCity,
        deliveryState: state.deliveryState,
        deliveryCountry: state.deliveryCountry,
        deliveryAddress: state.deliveryAddress,
        deliveryHouseNumber: state.deliveryHouseNumber,
        deliveryRoad: state.deliveryRoad,
        latitude: state.latitude,
        longitude: state.longitude,
        accuracy: state.accuracy,
        accuracyLevel: state.accuracyLevel,
        source: state.source,
        userConfirmed: state.userConfirmed
      })
    }
  )
);
