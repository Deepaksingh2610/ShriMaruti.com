import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import { Building2, Send, ShieldCheck, Users, PackageCheck, Truck, Sparkles, CheckCircle2, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

const corporateSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  companyName: z.string().min(2, 'Company name is required'),
  email: z.string().email('Valid business email is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  numberOfGifts: z.number({ invalid_type_error: 'Number of gifts must be a number' }).min(1, 'Please enter quantity'),
  preferredDeliveryDate: z.string().optional(),
  budgetPerGift: z.string().optional(),
  message: z.string().optional()
});

const SUITABLE_FOR = [
  'Employee Gifting',
  'Client Gifting',
  'Customer Appreciation',
  'Festive Corporate Gifting',
  'Event Gifting',
  'Business Anniversaries',
  'Employee Milestones',
  'Welcome Kits',
  'Custom Bulk Orders'
];

const BULK_BENEFITS = [
  { title: 'Dedicated Assistance', desc: 'Direct coordination with a corporate account manager to plan your requirements.' },
  { title: 'Bulk Order Support', desc: 'End-to-end processing and batch scheduling for high-volume orders.' },
  { title: 'Multiple Gifting Options', desc: 'Curated selection spanning personalized frames, hampers, and custom creations.' },
  { title: 'Customization Where Available', desc: 'Options to incorporate custom branding, name engraving, or message cards.' },
  { title: 'Flexible Quantity Requirements', desc: 'Solutions tailored to both medium-scale business teams and large enterprise rollouts.' },
  { title: 'Delivery Coordination', desc: 'Structured dispatch and logistics support to ensure coordinated delivery.' }
];

const CorporateBulkGiftingPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(corporateSchema),
    defaultValues: { numberOfGifts: 25 }
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        contactPerson: data.fullName,
        companyName: data.companyName,
        email: data.email,
        phone: data.phone,
        quantity: data.numberOfGifts,
        numberOfGifts: data.numberOfGifts,
        preferredDate: data.preferredDeliveryDate,
        budgetPerGift: data.budgetPerGift,
        notes: data.message,
        message: data.message
      };

      const res = await API.post('/corporate/inquiry', payload);
      if (res.data.success) {
        toast.success('Corporate inquiry submitted successfully!');
        setIsSuccess(true);
        reset();
      }
    } catch (err) {
      toast.error('Failed to submit corporate inquiry. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Corporate & Bulk Gifting - Shri Maruti"
        description="Make business relationships more memorable with thoughtful corporate gifting solutions. Explore options for employee gifting, client appreciation, and festive milestones."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Corporate & Bulk Gifting</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <Building2 className="w-3.5 h-3.5" />
          <span>B2B & Enterprise Solutions</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Corporate & Bulk Gifting
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Make business relationships more memorable with thoughtful corporate gifting solutions.
        </p>
        <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Whether you are planning gifts for employees, clients, customers, partners, or a special corporate occasion, Shri Maruti can help you explore suitable gifting options.
        </p>
      </div>

      {/* Suitable For Grid */}
      <section className="space-y-5">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Suitable For Every Corporate Occasion</h2>
          <p className="text-xs text-slate-500">Tailored options for events, relationships, and milestones</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {SUITABLE_FOR.map((item, idx) => (
            <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bulk Order Benefits */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Bulk Order Benefits</h2>
          <p className="text-xs text-slate-500">Why businesses choose Shri Maruti for their gifting programs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BULK_BENEFITS.map((benefit, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <PackageCheck className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">{benefit.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Inquiry Form */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Corporate Inquiry Form</h2>
          <p className="text-xs text-slate-500">
            Submit your requirements below and our corporate gifting team will reach out with recommendations.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-900">Thank You for Your Corporate Inquiry!</h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Your inquiry has been stored securely in our system. A corporate gifting coordinator will review your requirements and reach out to discuss suitable options.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-3 px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="e.g. Vikramaditya Rao"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
                {errors.fullName && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.fullName.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Name *</label>
                <input
                  type="text"
                  {...register('companyName')}
                  placeholder="e.g. Acme Technologies Ltd"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
                {errors.companyName && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.companyName.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Business Email *</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
                {errors.email && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.email.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="10-digit mobile or office contact"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
                {errors.phone && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.phone.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Number of Gifts *</label>
                <input
                  type="number"
                  {...register('numberOfGifts', { valueAsNumber: true })}
                  placeholder="e.g. 50"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-bold"
                />
                {errors.numberOfGifts && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.numberOfGifts.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Preferred Delivery Date</label>
                <input
                  type="date"
                  {...register('preferredDeliveryDate')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Budget Per Gift (Approx INR)</label>
                <input
                  type="text"
                  {...register('budgetPerGift')}
                  placeholder="e.g. ₹500 - ₹1,500 per gift"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Message / Requirements</label>
                <textarea
                  rows={4}
                  {...register('message')}
                  placeholder="Tell us about your occasion, preferred products, custom branding requirements, etc."
                  className="w-full p-3.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Corporate Inquiry</span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default CorporateBulkGiftingPage;
