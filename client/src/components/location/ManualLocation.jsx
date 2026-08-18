import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';
import { streetSchema, pincodeSchema } from '../../utils/validation';

const manualAddressSchema = z.object({
  houseNumber: z.string().min(1, 'House/Flat number is required'),
  street: streetSchema,
  landmark: z.string().optional(),
  locality: z.string().min(2, 'Locality / Area is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: pincodeSchema
});

export const ManualLocation = ({ initialData = {}, onSave, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(manualAddressSchema),
    defaultValues: {
      houseNumber: initialData.houseNumber || '',
      street: initialData.street || initialData.road || '',
      landmark: initialData.landmark || '',
      locality: initialData.locality || initialData.place || '',
      city: initialData.city || 'Lucknow',
      state: initialData.state || 'Uttar Pradesh',
      pincode: initialData.pincode || '226028'
    }
  });

  const onSubmit = (data) => {
    const fullAddress = `${data.houseNumber}, ${data.street}, ${data.landmark ? `${data.landmark}, ` : ''}${data.locality}, ${data.city}, ${data.state} - ${data.pincode}`;

    onSave({
      ...data,
      address: fullAddress,
      source: 'manual',
      country: 'India',
      userConfirmed: true
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-amber-600" /> Enter Complete Address
        </h4>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-800 font-bold text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Flat / House / Building *</label>
          <input
            type="text"
            {...register('houseNumber')}
            placeholder="e.g. Flat 402, Block B"
            className="w-full px-3 py-2 border border-slate-300 focus:border-amber-500 rounded-xl outline-none"
          />
          {errors.houseNumber && <p className="text-rose-600 text-[11px] mt-0.5">{errors.houseNumber.message}</p>}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Street / Road *</label>
          <input
            type="text"
            {...register('street')}
            placeholder="e.g. Faizabad Road"
            className="w-full px-3 py-2 border border-slate-300 focus:border-amber-500 rounded-xl outline-none"
          />
          {errors.street && <p className="text-rose-600 text-[11px] mt-0.5">{errors.street.message}</p>}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Locality / Colony / Sector *</label>
          <input
            type="text"
            {...register('locality')}
            placeholder="e.g. Indira Nagar / Sector 14"
            className="w-full px-3 py-2 border border-slate-300 focus:border-amber-500 rounded-xl outline-none"
          />
          {errors.locality && <p className="text-rose-600 text-[11px] mt-0.5">{errors.locality.message}</p>}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Landmark (Optional)</label>
          <input
            type="text"
            {...register('landmark')}
            placeholder="e.g. Near Wave Mall"
            className="w-full px-3 py-2 border border-slate-300 focus:border-amber-500 rounded-xl outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">City *</label>
          <input
            type="text"
            {...register('city')}
            placeholder="e.g. Lucknow"
            className="w-full px-3 py-2 border border-slate-300 focus:border-amber-500 rounded-xl outline-none"
          />
          {errors.city && <p className="text-rose-600 text-[11px] mt-0.5">{errors.city.message}</p>}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">State *</label>
          <input
            type="text"
            {...register('state')}
            placeholder="e.g. Uttar Pradesh"
            className="w-full px-3 py-2 border border-slate-300 focus:border-amber-500 rounded-xl outline-none"
          />
          {errors.state && <p className="text-rose-600 text-[11px] mt-0.5">{errors.state.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="font-bold text-slate-700 block mb-1">6-Digit PIN Code *</label>
          <input
            type="text"
            maxLength={6}
            {...register('pincode')}
            placeholder="e.g. 226028"
            className="w-full px-4 py-2.5 border-2 border-slate-300 focus:border-amber-500 rounded-xl text-center font-black tracking-widest text-base outline-none"
          />
          {errors.pincode && <p className="text-rose-600 text-[11px] mt-0.5 text-center">{errors.pincode.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Save & Use This Address</span>
      </button>
    </form>
  );
};

export default ManualLocation;
