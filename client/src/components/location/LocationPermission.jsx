import React from 'react';
import { AlertCircle, Lock, Compass, ShieldAlert, ArrowRight } from 'lucide-react';

export const LocationPermission = ({ permissionStatus, onManualPincode, onManualAddress }) => {
  if (permissionStatus === 'denied') {
    return (
      <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 space-y-3 animate-fadeIn">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-xl flex-shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-rose-950 text-sm">Location permission is disabled</h4>
            <p className="text-rose-800 leading-relaxed">
              Your browser or device has blocked location access. To auto-detect your location, enable location in your browser site settings or choose a manual option below.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-rose-200/60">
          <button
            type="button"
            onClick={onManualPincode}
            className="flex-1 py-2 px-3 bg-white hover:bg-rose-100/60 border border-rose-200 rounded-xl text-rose-900 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <span>Enter PIN Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onManualAddress}
            className="flex-1 py-2 px-3 bg-white hover:bg-rose-100/60 border border-rose-200 rounded-xl text-rose-900 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <span>Enter Address Manually</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (permissionStatus === 'unsupported') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Device Geolocation Not Supported</span>
        </div>
        <p className="text-amber-800 text-[11px]">
          Your browser does not support HTML5 GPS location. Please enter your 6-digit PIN code or manual delivery address.
        </p>
      </div>
    );
  }

  return null;
};

export default LocationPermission;
