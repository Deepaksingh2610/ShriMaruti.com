import React from 'react';
import { useLocationStore } from '../store/useLocationStore';
import LocationSelector from './location/LocationSelector';

/**
 * DeliveryModal - Mounts the production-ready LocationSelector
 * connected to the global useLocationStore state.
 */
const DeliveryModal = () => {
  const { isModalOpen, closeModal } = useLocationStore();

  return (
    <LocationSelector
      isOpen={isModalOpen}
      onClose={closeModal}
    />
  );
};

export default DeliveryModal;
