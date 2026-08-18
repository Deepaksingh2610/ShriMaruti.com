import React, { useState } from 'react';
import {
  MapPin, CheckCircle2, AlertTriangle, RefreshCw,
  Building2, Map, Compass, Navigation, Edit3, ArrowRight
} from 'lucide-react';
import { calculateLocationConfidence, ACCURACY_LEVELS } from '../../services/locationService';

export const DetectedLocation = ({
  location,
  onConfirm,
  onChange,
  onRetry,
  isRetrying = false
}) => {
  if (!location) return null;

  const [selectedPlace, setSelectedPlace] = useState(location.locality || location.place || location.city || '');
  const [houseNumberInput, setHouseNumberInput] = useState(location.houseNumber || '');
  const [manualPincode, setManualPincode] = useState(location.pincode || '');
  const [showAddressEdit, setShowAddressEdit] = useState(!location.pincode);

  const confidence = calculateLocationConfidence(location.accuracy, Boolean(manualPincode || location.pincode));
  const isPoorAccuracy = location.accuracyLevel === ACCURACY_LEVELS.POOR || location.accuracyLevel === ACCURACY_LEVELS.VERY_POOR;
  const isPincodeMissing = !location.pincode && !manualPincode;

  const handleUseLocation = () => {
    onConfirm({
      ...location,
      locality: selectedPlace,
      houseNumber: houseNumberInput,
      pincode: manualPincode || location.pincode || ''
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-4 text-xs animate-fadeIn">
      
      {/* Header with GPS Status and Accuracy Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
            <Compass className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm block">Location Detected</span>
            <span className="text-[10px] text-slate-500">Source: Browser GPS</span>
          </div>
        </div>

        {/* Accuracy Level Badge */}
        <div className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold flex items-center gap-1.5 ${confidence.badgeColor}`}>
          <span className={`w-2 h-2 rounded-full ${confidence.dotColor} animate-ping`} />
          <span>{confidence.label} {location.accuracy ? `(~${Math.round(location.accuracy)}m)` : ''}</span>
        </div>
      </div>

      {/* Poor Accuracy Warning Notice */}
      {isPoorAccuracy && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3 space-y-2 text-amber-900">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Your device could not determine a precise location.</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                The GPS accuracy is around ~{Math.round(location.accuracy || 0)}m. We recommend entering your PIN code or verifying your flat/house number below.
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="py-1.5 px-3 bg-white hover:bg-amber-100/80 border border-amber-300 rounded-lg text-amber-900 font-bold text-[11px] flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Sampling GPS...' : 'Try Better GPS Reading'}</span>
            </button>
            <button
              type="button"
              onClick={onChange}
              className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition"
            >
              Enter PIN / Address
            </button>
          </div>
        </div>
      )}

      {/* Main Detected Location Details */}
      <div className="bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
        
        {/* Locality & City */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Area / Locality</span>
            <p className="font-extrabold text-slate-900 text-sm">{selectedPlace || location.locality || location.city || 'Detected Area'}</p>
            <p className="text-slate-600 text-xs font-semibold">
              {location.district ? `${location.district}, ` : ''}{location.state}, {location.country || 'India'}
            </p>
          </div>
          {location.pincode ? (
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-2.5 py-1 rounded-xl">
              PIN: {location.pincode}
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-lg">
              PIN Required
            </span>
          )}
        </div>

        {/* Missing PIN Code Prompt */}
        {isPincodeMissing && (
          <div className="bg-white p-3 rounded-xl border border-amber-300 space-y-1.5">
            <label className="font-bold text-slate-800 text-[11px] block">
              PIN Code not detected from GPS. Please enter your 6-digit PIN: *
            </label>
            <input
              type="text"
              maxLength={6}
              value={manualPincode}
              onChange={(e) => setManualPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 226028"
              className="w-full px-3 py-2 border-2 border-amber-400 focus:border-amber-600 rounded-xl text-center font-black tracking-widest text-base outline-none"
            />
          </div>
        )}

        {/* Optional House/Flat number input */}
        <div className="pt-1">
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            House / Flat / Building No. & Landmark (Optional):
          </label>
          <input
            type="text"
            value={houseNumberInput}
            onChange={(e) => setHouseNumberInput(e.target.value)}
            placeholder="e.g. Flat 302, Royal Residency, Near City Mall"
            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs outline-none text-slate-800 font-medium"
          />
        </div>

        {/* Approximate Accuracy Note */}
        <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200/60 pt-2">
          <span>GPS Coordinates: {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}</span>
          <span className="font-medium">{confidence.description}</span>
        </div>
      </div>

      {/* OpenStreetMap Attribution */}
      {location.attribution && (
        <p className="text-[9px] text-slate-400 text-center tracking-tight">
          Reverse Geocoding provided via {location.attribution}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleUseLocation}
          className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Use This Location</span>
        </button>

        <button
          type="button"
          onClick={onChange}
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition"
        >
          Change
        </button>
      </div>
    </div>
  );
};

export default DetectedLocation;
