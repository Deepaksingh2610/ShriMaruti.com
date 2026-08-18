import { useState, useEffect, useCallback } from 'react';
import {
  detectCurrentLocation,
  validatePincode,
  checkPermissionStatus,
  calculateLocationConfidence,
  ACCURACY_LEVELS
} from '../services/locationService';
import { useLocationStore } from '../store/useLocationStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export function useLocation() {
  const { user } = useAuthStore();
  const locationStore = useLocationStore();

  const [status, setStatus] = useState('idle'); // 'idle' | 'detecting' | 'detected' | 'error'
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Check browser permission status on mount
  useEffect(() => {
    let isMounted = true;
    checkPermissionStatus().then((perm) => {
      if (isMounted) setPermissionStatus(perm);
    });
    return () => { isMounted = false; };
  }, []);

  /**
   * Primary location detection handler
   */
  const detectLocation = useCallback(async (options = {}) => {
    setStatus('detecting');
    setErrorMessage('');

    try {
      const result = await detectCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        ...options
      });

      setDetectedLocation(result);
      setStatus('detected');
      setRetryCount(0);

      // Refresh permission state
      const perm = await checkPermissionStatus();
      setPermissionStatus(perm);

      // Notify based on accuracy level
      if (result.accuracyLevel === ACCURACY_LEVELS.EXCELLENT || result.accuracyLevel === ACCURACY_LEVELS.GOOD) {
        toast.success(`Location detected near ${result.locality || result.city} (~${Math.round(result.accuracy)}m)`);
      } else if (result.accuracyLevel === ACCURACY_LEVELS.ACCEPTABLE) {
        toast.success(`Approximate location detected (~${Math.round(result.accuracy)}m)`);
      } else {
        toast('Device reported approximate location. Please verify your details.', {
          icon: '📍',
          duration: 4500
        });
      }

      return result;
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);

      // Refresh permission state in case user denied
      const perm = await checkPermissionStatus();
      setPermissionStatus(perm);

      toast.error(err.message || 'Could not detect location. Please select manually.');
      throw err;
    }
  }, []);

  /**
   * Retry detection with higher duration/readings
   */
  const retryDetection = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    return detectLocation({
      watchDurationMs: 6000,
      targetAccuracyMeters: 25
    });
  }, [detectLocation]);

  /**
   * Confirm and save location to global store and backend
   */
  const confirmLocation = useCallback(async (customOverrides = {}) => {
    if (!detectedLocation && !customOverrides.pincode) {
      toast.error('No location details to confirm.');
      return false;
    }

    const merged = {
      ...(detectedLocation || {}),
      ...customOverrides,
      userConfirmed: true,
      confirmedAt: new Date().toISOString()
    };

    // If locality is missing, fallback to place or city
    const finalPlace = merged.locality || merged.neighbourhood || merged.place || merged.city || 'Local Area';
    const finalDistrict = merged.district || merged.city || 'Lucknow';
    const finalCity = merged.city || finalDistrict;
    const finalState = merged.state || 'Uttar Pradesh';
    const finalPincode = merged.pincode || '';

    await locationStore.setLocation({
      latitude: merged.latitude,
      longitude: merged.longitude,
      accuracy: merged.accuracy,
      accuracyLevel: merged.accuracyLevel,
      address: merged.address || merged.fullAddress || '',
      houseNumber: merged.houseNumber || '',
      road: merged.road || '',
      locality: finalPlace,
      neighbourhood: merged.neighbourhood || '',
      city: finalCity,
      district: finalDistrict,
      state: finalState,
      country: merged.country || 'India',
      pincode: finalPincode,
      source: merged.source || 'browser-gps',
      userConfirmed: true
    }, !!user);

    toast.success(`Delivery location set to ${finalPlace}, ${finalCity} ${finalPincode ? `(${finalPincode})` : ''}`);
    return true;
  }, [detectedLocation, locationStore, user]);

  /**
   * Manual PIN code selection
   */
  const setPincodeManual = useCallback(async (pin) => {
    setStatus('detecting');
    setErrorMessage('');

    const validation = await validatePincode(pin);
    if (!validation.isValid) {
      setStatus('error');
      setErrorMessage(validation.message);
      toast.error(validation.message);
      return validation;
    }

    const locationObj = {
      pincode: validation.pincode,
      locality: validation.place,
      place: validation.place,
      district: validation.district,
      city: validation.city,
      state: validation.state,
      country: 'India',
      source: 'pincode',
      accuracy: null,
      accuracyLevel: null,
      confidence: {
        level: 'PINCODE_VERIFIED',
        label: 'Postal PIN Verified',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        dotColor: 'bg-blue-500',
        description: 'Postal area verified via India Post directory.',
        isPrecise: true
      },
      placesList: validation.placesList || [],
      userConfirmed: false
    };

    setDetectedLocation(locationObj);
    setStatus('detected');
    toast.success(`PIN ${pin} verified: ${validation.place}, ${validation.district}`);
    return locationObj;
  }, []);

  /**
   * Manual Address selection
   */
  const setAddressManual = useCallback(async (addressData) => {
    const locationObj = {
      ...addressData,
      source: 'manual',
      accuracy: null,
      accuracyLevel: null,
      confidence: {
        level: 'MANUAL_ENTRY',
        label: 'Manual Address',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        dotColor: 'bg-purple-500',
        description: 'Custom shipping destination entered manually.',
        isPrecise: true
      },
      userConfirmed: true
    };

    await confirmLocation(locationObj);
    return locationObj;
  }, [confirmLocation]);

  const resetLocation = useCallback(() => {
    setStatus('idle');
    setDetectedLocation(null);
    setErrorMessage('');
  }, []);

  return {
    // Reactive State
    status,
    isDetecting: status === 'detecting',
    isDetected: status === 'detected',
    isError: status === 'error',
    permissionStatus,
    detectedLocation,
    errorMessage,
    retryCount,
    confidence: detectedLocation ? calculateLocationConfidence(detectedLocation.accuracy, Boolean(detectedLocation.pincode)) : null,

    // Active Global Location
    activeLocation: {
      latitude: locationStore.latitude,
      longitude: locationStore.longitude,
      accuracy: locationStore.accuracy,
      accuracyLevel: locationStore.accuracyLevel,
      address: locationStore.deliveryAddress,
      houseNumber: locationStore.deliveryHouseNumber,
      road: locationStore.deliveryRoad,
      locality: locationStore.deliveryPlace,
      place: locationStore.deliveryPlace,
      district: locationStore.deliveryDistrict,
      city: locationStore.deliveryCity,
      state: locationStore.deliveryState,
      pincode: locationStore.deliveryPincode,
      source: locationStore.source,
      userConfirmed: locationStore.userConfirmed
    },

    // Actions
    detectLocation,
    retryDetection,
    confirmLocation,
    setPincodeManual,
    setAddressManual,
    resetLocation,
    openModal: locationStore.openModal,
    closeModal: locationStore.closeModal,
    isModalOpen: locationStore.isModalOpen
  };
}
