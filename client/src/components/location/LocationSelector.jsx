import React, { useState } from 'react';
import {
  MapPin, X, Navigation, Loader2, Compass,
  Building2, Map, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useLocation } from '../../hooks/useLocation';
import LocationPermission from './LocationPermission';
import DetectedLocation from './DetectedLocation';
import PincodeInput from './PincodeInput';
import ManualLocation from './ManualLocation';

export const LocationSelector = ({ isOpen, onClose }) => {
  const {
    status,
    isDetecting,
    permissionStatus,
    detectedLocation,
    errorMessage,
    retryCount,
    activeLocation,
    detectLocation,
    retryDetection,
    confirmLocation,
    setPincodeManual,
    setAddressManual,
    resetLocation
  } = useLocation();

  // Active view: 'auto' | 'pincode' | 'manual' | 'detected'
  const [view, setView] = useState('auto');

  if (!isOpen) return null;

  const handleStartAutoDetect = async () => {
    try {
      setView('detected');
      await detectLocation();
    } catch (_err) {
      // Permission / error handled in hook
    }
  };

  const handleConfirmDetected = async (confirmedLoc) => {
    await confirmLocation(confirmedLoc);
    onClose();
  };

  const handleManualPincodeSelect = async (pincodeLoc) => {
    await confirmLocation(pincodeLoc);
    onClose();
  };

  const handleManualAddressSave = async (manualAddr) => {
    await setAddressManual(manualAddr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
          aria-label="Close location selector"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-600 to-amber-500 p-3 rounded-2xl text-white shadow-md">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Delivery Destination</h3>
            <p className="text-xs text-slate-500">Detect or select your delivery location for fast dispatch</p>
          </div>
        </div>

        {/* Permission Warnings (if denied) */}
        {permissionStatus === 'denied' && (
          <LocationPermission
            permissionStatus={permissionStatus}
            onManualPincode={() => setView('pincode')}
            onManualAddress={() => setView('manual')}
          />
        )}

        {/* Main View Router */}
        {view === 'auto' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Auto GPS Detection Button */}
            <button
              onClick={handleStartAutoDetect}
              disabled={isDetecting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 font-extrabold text-xs rounded-2xl border-2 border-amber-300 flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition disabled:opacity-60"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>📍 Detecting your location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-amber-600 fill-amber-600 animate-bounce" />
                  <span>Use Current Location (High-Accuracy GPS)</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] text-slate-400 font-black tracking-widest uppercase absolute">
                OR SELECT MANUALLY
              </span>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setView('pincode')}
                className="p-3.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-2xl text-left space-y-1 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs group-hover:text-amber-700">Enter PIN Code</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                </div>
                <p className="text-[10px] text-slate-500">Fast 6-digit postal lookup</p>
              </button>

              <button
                type="button"
                onClick={() => setView('manual')}
                className="p-3.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-2xl text-left space-y-1 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs group-hover:text-amber-700">Full Address</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                </div>
                <p className="text-[10px] text-slate-500">House number & street</p>
              </button>
            </div>
          </div>
        )}

        {/* View: Detected GPS Location */}
        {view === 'detected' && (
          <div>
            {isDetecting ? (
              <div className="py-8 px-4 text-center space-y-3 bg-amber-50/50 rounded-2xl border border-amber-200">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">📍 Detecting your location...</h4>
                  <p className="text-xs text-slate-600">Sampling high-accuracy GPS readings & verifying postal area</p>
                </div>
              </div>
            ) : detectedLocation ? (
              <DetectedLocation
                location={detectedLocation}
                onConfirm={handleConfirmDetected}
                onChange={() => setView('pincode')}
                onRetry={retryDetection}
                isRetrying={isDetecting}
              />
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
                  {errorMessage || 'Unable to determine GPS position.'}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={retryDetection}
                    className="flex-1 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('pincode')}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Enter PIN Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View: PIN Code Lookup */}
        {view === 'pincode' && (
          <PincodeInput
            initialPincode={activeLocation.pincode}
            onSelectLocation={handleManualPincodeSelect}
            onCancel={() => setView('auto')}
          />
        )}

        {/* View: Manual Address Form */}
        {view === 'manual' && (
          <ManualLocation
            initialData={activeLocation}
            onSave={handleManualAddressSave}
            onCancel={() => setView('auto')}
          />
        )}

        {/* Current Active Location Footer */}
        {activeLocation.pincode && (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate">
                Active: <strong className="text-slate-900">{activeLocation.locality || activeLocation.city}, {activeLocation.district} ({activeLocation.pincode})</strong>
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LocationSelector;
