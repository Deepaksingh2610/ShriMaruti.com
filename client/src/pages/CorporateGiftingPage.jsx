import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import { Building2, Send, ShieldCheck, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const corporateSchema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  contactPerson: z.string().min(2, 'Contact person name required'),
  email: z.string().email('Valid work email required'),
  phone: z.string().min(10, 'Valid 10-digit phone required'),
  quantity: z.number().min(10, 'Minimum bulk quantity is 10 units'),
  occasion: z.string().optional(),
  gstin: z.string().optional(),
  notes: z.string().optional()
});

const CorporateGiftingPage = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(corporateSchema),
    defaultValues: { quantity: 50 }
  });

  const onSubmit = async (data) => {
    try {
      const res = await API.post('/corporate/inquiry', data);
      if (res.data.success) {
        toast.success('Corporate gifting inquiry submitted! Our executive will call you within 2 hours.');
        reset();
      }
    } catch (err) {
      toast.error('Failed to submit inquiry');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <SEOHead title="Corporate Bulk Gifting" description="Customized corporate gift hampers, engraved plaques & festive hampers for employees and clients." />

      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5 text-amber-600" /> B2B Bulk Solutions
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Corporate & Bulk Gifting Solutions</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Reward employees, impress clients, and celebrate festive milestones with custom-branded luxury hampers & 3D art.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-2 shadow-sm">
          <Award className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">Custom Logo Branding</h4>
          <p className="text-xs text-slate-500">Laser engraving & custom box sleeve printing with your company logo.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-2 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">GST Invoice & Credit</h4>
          <p className="text-xs text-slate-500">Full 18% GST input tax credit invoice provided for business expenses.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-2 shadow-sm">
          <Send className="w-8 h-8 text-indigo-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">Multi-Address Dispatch</h4>
          <p className="text-xs text-slate-500">Direct doorstep delivery to 500+ employee home addresses simultaneously.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Submit Bulk Inquiry Request</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Company Name *</label>
            <input
              type="text"
              {...register('companyName')}
              className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
            />
            {errors.companyName && <span className="text-[11px] text-rose-600">{errors.companyName.message}</span>}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person Name *</label>
            <input
              type="text"
              {...register('contactPerson')}
              className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
            />
            {errors.contactPerson && <span className="text-[11px] text-rose-600">{errors.contactPerson.message}</span>}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Official Work Email *</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
            />
            {errors.email && <span className="text-[11px] text-rose-600">{errors.email.message}</span>}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Phone / WhatsApp Number *</label>
            <input
              type="text"
              {...register('phone')}
              className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
            />
            {errors.phone && <span className="text-[11px] text-rose-600">{errors.phone.message}</span>}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Units Quantity *</label>
            <input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none font-bold"
            />
            {errors.quantity && <span className="text-[11px] text-rose-600">{errors.quantity.message}</span>}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN Number (Optional)</label>
            <input
              type="text"
              {...register('gstin')}
              placeholder="e.g. 09ABCDE1234F1Z5"
              className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none uppercase font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">Customization Requirements & Notes</label>
            <textarea
              rows={3}
              {...register('notes')}
              placeholder="Describe preferred items (e.g., Gourmet dry fruit hampers + logo engraved mugs needed for Diwali)..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
        >
          <Send className="w-4 h-4" />
          <span>Submit Bulk Quotation Request</span>
        </button>
      </form>
    </div>
  );
};

export default CorporateGiftingPage;
