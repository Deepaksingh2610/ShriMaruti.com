import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import { Gift, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const giftCardSchema = z.object({
  initialBalance: z.number().min(250, 'Minimum Gift Card value is ₹250'),
  purchaserName: z.string().min(2, 'Your name is required'),
  purchaserEmail: z.string().email('Valid email required'),
  recipientName: z.string().min(2, 'Recipient name is required'),
  recipientEmail: z.string().email('Valid recipient email required'),
  giftMessage: z.string().optional()
});

const GiftCardsPage = () => {
  const [createdCard, setCreatedCard] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(giftCardSchema),
    defaultValues: { initialBalance: 1000 }
  });

  const selectedBalance = watch('initialBalance');

  const onSubmit = async (data) => {
    try {
      const res = await API.post('/giftcards/purchase', data);
      if (res.data.success) {
        setCreatedCard(res.data.giftCard);
        toast.success('Digital Gift Card created & emailed to recipient!');
      }
    } catch (err) {
      toast.error('Failed to create gift card');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <SEOHead title="Digital Gift Cards" />

      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full uppercase tracking-wider">
          <Gift className="w-3.5 h-3.5 text-amber-600" /> Instant E-Gift Card
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Send A Shri Maruti E-Gift Card</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          The perfect gift when you want them to choose their favourite flower arrangement, cake, or 3D mandir!
        </p>
      </div>

      {createdCard ? (
        <div className="bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-700 text-white rounded-3xl p-8 shadow-2xl space-y-4 text-center max-w-lg mx-auto">
          <CheckCircle2 className="w-12 h-12 mx-auto text-amber-200" />
          <h3 className="text-2xl font-black">Gift Card Generated!</h3>
          <p className="text-xs text-amber-100">An email with the digital voucher has been sent to <strong>{createdCard.recipientEmail}</strong>.</p>
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 space-y-1">
            <span className="text-xs uppercase font-bold text-amber-100 block">Voucher Code</span>
            <span className="text-2xl font-black tracking-widest block">{createdCard.code}</span>
            <span className="text-sm font-bold block">Balance: ₹{createdCard.initialBalance}</span>
          </div>
          <button
            onClick={() => setCreatedCard(null)}
            className="px-6 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md"
          >
            Buy Another Gift Card
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          
          {/* Select Preset Amounts */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">Select Gift Card Amount:</label>
            <div className="grid grid-cols-4 gap-3">
              {[500, 1000, 2500, 5000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setValue('initialBalance', amt)}
                  className={`py-3 rounded-2xl text-xs font-black border transition ${
                    selectedBalance === amt ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
              <input
                type="text"
                {...register('purchaserName')}
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
              />
              {errors.purchaserName && <span className="text-[11px] text-rose-600">{errors.purchaserName.message}</span>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Email *</label>
              <input
                type="email"
                {...register('purchaserEmail')}
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
              />
              {errors.purchaserEmail && <span className="text-[11px] text-rose-600">{errors.purchaserEmail.message}</span>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Name *</label>
              <input
                type="text"
                {...register('recipientName')}
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
              />
              {errors.recipientName && <span className="text-[11px] text-rose-600">{errors.recipientName.message}</span>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Email (Voucher will be emailed here) *</label>
              <input
                type="email"
                {...register('recipientEmail')}
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
              />
              {errors.recipientEmail && <span className="text-[11px] text-rose-600">{errors.recipientEmail.message}</span>}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Personal Message</label>
              <textarea
                rows={2}
                {...register('giftMessage')}
                placeholder="Write a warm note..."
                className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Send className="w-4 h-4" />
            <span>Generate & Send Gift Card (₹{selectedBalance})</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default GiftCardsPage;
