import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import { Headphones, Mail, Phone, MessageSquare, Clock, Send, CheckCircle2, Package, CreditCard, Truck, User, Gift, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCompanySettings } from '../hooks/useCompanySettings';

const supportSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  orderId: z.string().optional(),
  category: z.string().min(1, 'Please select an issue category'),
  message: z.string().min(10, 'Please describe your query in at least 10 characters')
});

const HELP_CATEGORIES = [
  {
    title: 'Orders',
    icon: Package,
    topics: ['Track an order', 'Order status', 'Modify order', 'Cancel order']
  },
  {
    title: 'Payments',
    icon: CreditCard,
    topics: ['Payment failed', 'Payment deducted but order not confirmed', 'Refund status']
  },
  {
    title: 'Delivery',
    icon: Truck,
    topics: ['Delivery status', 'Address issue', 'Delivery availability', 'Recipient unavailable']
  },
  {
    title: 'Account',
    icon: User,
    topics: ['Login assistance', 'Account details', 'Password reset', 'Contact information']
  },
  {
    title: 'Products',
    icon: Gift,
    topics: ['Product information', 'Stock availability', 'Customization details', 'Product issues']
  }
];

const HelpCenterPage = () => {
  const { settings: companyConfig } = useCompanySettings();
  const [ticketResult, setTicketResult] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(supportSchema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await API.post('/content/support-ticket', data);
      if (res.data.success) {
        setTicketResult({
          ticketId: res.data.ticketId,
          message: res.data.message
        });
        toast.success('Support request submitted successfully!');
        reset();
      }
    } catch (err) {
      toast.error('Failed to submit support request. Please try again or reach out via email.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Help Center & Support - Shri Maruti"
        description="Need help with your order or account? Find answers to common questions or contact our support team."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Help</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Help Center & Support</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <Headphones className="w-3.5 h-3.5" />
          <span>Customer Assistance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Help Center & Support
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Need help with your order or account? Find answers to common questions or contact our support team.
        </p>
      </div>

      {/* Contact Channels Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Mail className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Support</h3>
          <p className="text-xs font-mono font-bold text-slate-900">{companyConfig.support.email}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Phone className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Helpline</h3>
          <p className="text-xs font-bold text-slate-900">{companyConfig.support.phone}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">WhatsApp</h3>
          <p className="text-xs font-bold text-slate-900">{companyConfig.support.whatsapp}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Support Hours</h3>
          <p className="text-xs font-bold text-slate-900">{companyConfig.support.hours}</p>
        </div>
      </section>

      {/* Help Categories */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Explore Help by Category</h2>
          <p className="text-xs text-slate-500">Quick links to address your queries</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HELP_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <Icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{cat.title}</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {cat.topics.map((t, tIdx) => (
                    <li key={tIdx} className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Support Form Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Submit a Support Request</h2>
          <p className="text-xs text-slate-500">
            Fill out the details below and our customer support team will assist you.
          </p>
        </div>

        {ticketResult ? (
          <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-900">Support Request Submitted</h3>
            <p className="text-xs text-emerald-800">
              Reference Ticket ID: <strong className="font-mono bg-white px-2.5 py-1 rounded-md border border-emerald-300">{ticketResult.ticketId}</strong>
            </p>
            <p className="text-xs text-slate-600 max-w-md mx-auto">{ticketResult.message}</p>
            <button
              onClick={() => setTicketResult(null)}
              className="mt-3 px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Anand Sharma"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
                {errors.name && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.name.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@email.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
                {errors.email && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.email.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Order ID (Optional)</label>
                <input
                  type="text"
                  {...register('orderId')}
                  placeholder="e.g. ORD-2026-12345"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Category *</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                >
                  <option value="">-- Select Category --</option>
                  <option value="Orders & Tracking">Orders & Tracking</option>
                  <option value="Payments & Refund">Payments & Refund</option>
                  <option value="Delivery & Address">Delivery & Address</option>
                  <option value="Product & Customization">Product & Customization</option>
                  <option value="Account & General">Account & General Inquiry</option>
                </select>
                {errors.category && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.category.message}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Message *</label>
                <textarea
                  rows={4}
                  {...register('message')}
                  placeholder="Please describe your issue or question in detail..."
                  className="w-full p-3.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
                {errors.message && <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.message.message}</span>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Support Request</span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default HelpCenterPage;
