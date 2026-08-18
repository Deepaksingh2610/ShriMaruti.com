import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import { Scale, User, Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCompanySettings } from '../hooks/useCompanySettings';

const grievanceSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid 10-digit phone is required'),
  orderId: z.string().optional(),
  category: z.string().min(1, 'Please select a complaint category'),
  description: z.string().min(15, 'Please provide a detailed description (min 15 characters)'),
  documentUrl: z.string().optional()
});

const GrievanceRedressalPage = () => {
  const { settings: companyConfig } = useCompanySettings();
  const [submissionResult, setSubmissionResult] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(grievanceSchema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await API.post('/content/grievance', data);
      if (res.data.success) {
        setSubmissionResult({
          ticketId: res.data.ticketId,
          message: res.data.message
        });
        toast.success('Grievance submitted successfully!');
        reset();
      }
    } catch (err) {
      toast.error('Failed to submit grievance. Please verify your details or email the Grievance Officer.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Grievance Redressal - Shri Maruti"
        description="Official Grievance Redressal mechanism, Grievance Officer contact details, and formal complaint submission."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Consumer Policy</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Grievance Redressal</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <Scale className="w-3.5 h-3.5" />
          <span>Consumer Protection & Redressal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Grievance Redressal
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          We are committed to addressing customer concerns fairly and efficiently.
        </p>
        <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
          If you have a complaint that has not been resolved through regular customer support, you may submit a grievance through the designated grievance channel.
        </p>
      </div>

      {/* Designated Grievance Officer Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Designated Grievance Officer</h2>
          <p className="text-xs text-slate-500 mt-1">Official contact information pursuant to applicable Consumer Protection rules</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <User className="w-4 h-4 text-amber-600" />
              <span>Officer Name</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900">{companyConfig.grievance.officerName}</p>
            <p className="text-[11px] text-slate-500">{companyConfig.grievance.designation}</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Mail className="w-4 h-4 text-amber-600" />
              <span>Official Email</span>
            </div>
            <p className="text-xs font-mono font-bold text-slate-900">{companyConfig.grievance.email}</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Official Phone</span>
            </div>
            <p className="text-xs font-bold text-slate-900">{companyConfig.grievance.phone}</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Official Address</span>
            </div>
            <p className="text-xs text-slate-700 leading-snug">{companyConfig.grievance.address}</p>
          </div>
        </div>
      </section>

      {/* Grievance Submission Form */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Formal Grievance Submission</h2>
          <p className="text-xs text-slate-500">
            Submit an escalated complaint directly to the Grievance Redressal desk.
          </p>
        </div>

        {submissionResult ? (
          <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-900">Grievance Successfully Registered</h3>
            <div className="p-4 bg-white rounded-xl border border-emerald-300 inline-block">
              <span className="text-xs text-slate-500 block">Grievance Reference Number:</span>
              <span className="text-base font-mono font-extrabold text-slate-900">{submissionResult.ticketId}</span>
            </div>
            <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
              {submissionResult.message}
            </p>
            <div>
              <button
                onClick={() => setSubmissionResult(null)}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition"
              >
                Submit Another Grievance
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
                {errors.fullName && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.fullName.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@domain.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
                {errors.email && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.email.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
                {errors.phone && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.phone.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Order ID (if applicable)</label>
                <input
                  type="text"
                  {...register('orderId')}
                  placeholder="e.g. ORD-2026-98765"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Complaint Category *</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                >
                  <option value="">-- Select Category --</option>
                  <option value="Unresolved Order Issue">Unresolved Order Issue</option>
                  <option value="Payment / Refund Dispute">Payment / Refund Dispute</option>
                  <option value="Product Quality Concern">Product Quality Concern</option>
                  <option value="Data Privacy & Information">Data Privacy & Information</option>
                  <option value="Consumer Rights & Escalation">Consumer Rights & Escalation</option>
                  <option value="Other">Other Grievance</option>
                </select>
                {errors.category && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.category.message}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Complaint Description *</label>
                <textarea
                  rows={5}
                  {...register('description')}
                  placeholder="Please state the factual details of your grievance, including dates, previous communication with support, and desired resolution..."
                  className="w-full p-3.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
                {errors.description && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.description.message}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Supporting Document / Image URL (Optional)</label>
                <input
                  type="url"
                  {...register('documentUrl')}
                  placeholder="https://... (Link to uploaded invoice or photo proof)"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Grievance</span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default GrievanceRedressalPage;
