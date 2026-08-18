import React, { useState, useEffect } from 'react';
import { Loader2, Search, Building2, Map, CheckCircle2, AlertCircle } from 'lucide-react';
import { validatePincode } from '../../services/locationService';
import toast from 'react-hot-toast';

export const PincodeInput = ({ initialPincode = '', onSelectLocation, onCancel }) => {
  const [pin, setPin] = useState(initialPincode);
  const [loading, setLoading] = useState(false);
  const [pincodeData, setPincodeData] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (/^[1-9][0-9]{5}$/.test(pin)) {
      handleLookup(pin);
    } else {
      setPincodeData(null);
      setErrorMsg('');
    }
  }, [pin]);

  const handleLookup = async (inputPin) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await validatePincode(inputPin);
      if (result.isValid) {
        setPincodeData(result);
        setSelectedPlace(result.place);
      } else {
        setErrorMsg(result.message || 'Invalid PIN code');
        setPincodeData(null);
      }
    } catch (_err) {
      setErrorMsg('Could not verify PIN code. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      toast.error('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!pincodeData) {
      toast.error('Verifying PIN code...');
      return;
    }

    onSelectLocation({
      pincode: pin,
      locality: selectedPlace || pincodeData.place,
      place: selectedPlace || pincodeData.place,
      district: pincodeData.district,
      city: pincodeData.city || pincodeData.district,
      state: pincodeData.state,
      country: 'India',
      source: 'pincode',
      userConfirmed: true
    });
  };

  return (
    <form onSubmit={handleConfirm} className="space-y-4 text-xs animate-fadeIn">
      <div className="space-y-1.5">
        <label className="font-extrabold text-slate-900 block text-xs">
          Enter 6-Digit Indian Delivery PIN Code:
        </label>
        <div className="relative">
          <input
            type="text"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 226028, 201301, 110001"
            className="w-full px-4 py-3 border-2 border-slate-200 focus:border-amber-500 rounded-2xl text-center font-black tracking-widest text-lg text-slate-900 outline-none transition"
            autoFocus
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs bg-rose-50 p-2.5 rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verified Pincode Details Card */}
      {pincodeData && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-600" /> Postal Directory Verified
            </span>
            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
              ✓ Valid PIN
            </span>
          </div>

          {pincodeData.placesList && pincodeData.placesList.length > 1 ? (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-800 block">Select Exact Delivery Area / Post Office:</label>
              <select
                value={selectedPlace}
                onChange={(e) => setSelectedPlace(e.target.value)}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-sm"
              >
                {pincodeData.placesList.map((pl, idx) => (
                  <option key={idx} value={pl}>{pl}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="text-slate-500">Area / Place:</span>
              <span className="text-slate-900 font-extrabold">{pincodeData.place}</span>
            </div>
          )}

          <div className="flex items-center justify-between font-bold text-slate-800 border-t border-amber-200/60 pt-1.5">
            <span className="text-slate-500">District:</span>
            <span className="text-slate-900 font-extrabold">{pincodeData.district}</span>
          </div>

          <div className="flex items-center justify-between text-slate-700 text-[11px] border-t border-amber-200/60 pt-1.5">
            <span>State:</span>
            <span className="font-semibold text-slate-600">{pincodeData.state}, India</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!pincodeData || loading}
          className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirm PIN Code</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
          >
            Back
          </button>
        )}
      </div>
    </form>
  );
};

export default PincodeInput;
