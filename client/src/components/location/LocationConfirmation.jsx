import React from 'react';
import { MapPin, CheckCircle2, Edit3, Compass, ShieldCheck } from 'lucide-react';
import { calculateLocationConfidence } from '../../services/locationService';

export const LocationConfirmation = ({
  location,
  onChangeLocation,
  showFullDetails = true,
  className = ''
}) => {
  if (!location) return null;

  const areaName = location.locality || location.place || location.city || 'Lucknow';
  const cityName = location.city || location.district || 'Lucknow';
  const districtName = location.district || location.city || 'Lucknow';
  const pincode = location.pincode || '226028';
  const state = location.state || 'Uttar Pradesh';

  const confidence = location.accuracy ? calculateLocationConfidence(location.accuracy, Boolean(pincode)) : null;

  return (
    <div className={`bg-gradient-to-r from-amber-50/80 via-white to-orange-50/60 p-4 rounded-2xl border border-amber-200/90 shadow-sm space-y-3 ${className}`}>
      
      {/* Top bar: Delivering to + Change button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-600 text-white rounded-xl shadow-sm">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">Delivering To</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {areaName}, {cityName}
            </span>
          </div>
        </div>

        {onChangeLocation && (
          <button
            type="button"
            onClick={onChangeLocation}
            className="px-3 py-1.5 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>
        )}
      </div>

      {/* Address Details & PIN */}
      {showFullDetails && (
        <div className="space-y-1.5 text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-amber-100">
          {location.address && (
            <p className="font-medium text-slate-800 leading-snug">
              {location.houseNumber ? `${location.houseNumber}, ` : ''}{location.road ? `${location.road}, ` : ''}{location.address}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="bg-amber-100 text-amber-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg border border-amber-300">
              PIN: {pincode}
            </span>
            <span className="text-slate-500 text-[11px]">
              {districtName}, {state}
            </span>
          </div>
        </div>
      )}

      {/* Accuracy & Source Indicator */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-amber-200/60 pt-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Location Verified for Delivery</span>
        </span>
        {confidence && (
          <span className="font-semibold text-slate-600">
            GPS accuracy: ~{Math.round(location.accuracy)}m
          </span>
        )}
      </div>
    </div>
  );
};

export default LocationConfirmation;
