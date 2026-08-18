import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { RotateCcw, AlertCircle, CheckCircle2, ShieldCheck, HelpCircle, FileText, Camera, CreditCard } from 'lucide-react';
import { useCompanySettings } from '../hooks/useCompanySettings';

const CancellationReturnsPage = () => {
  const { settings: companyConfig } = useCompanySettings();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Cancellation & Returns Policy - Shri Maruti"
        description="Understand Shri Maruti's order cancellation guidelines, return eligibility, damaged product resolution process, and refund timelines."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Help</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Cancellation & Returns</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Customer Protection Policy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Cancellation & Returns Policy
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Clear, transparent rules governing order cancellations, eligible returns, damaged item resolutions, and refund processing.
        </p>
      </div>

      {/* Order Cancellation Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Order Cancellation</h2>
          <p className="text-xs text-slate-500 mt-1">Guidelines for cancelling an order before fulfillment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700">
          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              When Cancellation is Allowed
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Standard non-personalized orders can be cancelled directly from your Account Order page before the package is handed over to the courier for dispatch.
            </p>
            <p className="text-slate-600 leading-relaxed">
              For personalized/custom items (e.g. photo frames, 3D laser lamps), cancellations are permitted within <strong>{companyConfig.legal.cancellationWindowHours} hour</strong> of placing the order before production begins.
            </p>
          </div>

          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              When Cancellation is Not Possible
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Cancellations cannot be processed once the parcel has been shipped or once custom engraving/manufacturing has already been completed.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Perishable items (such as fresh flower arrangements or fresh cakes) cannot be cancelled once preparation is underway.
            </p>
          </div>
        </div>
      </section>

      {/* Returns Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Returns & Eligibility</h2>
          <p className="text-xs text-slate-500 mt-1">
            Standard return window: <strong>{companyConfig.legal.returnEligibilityDays} days</strong> from delivery for eligible categories
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <h4 className="font-bold text-emerald-900">Eligible for Return / Replacement:</h4>
              <ul className="list-disc pl-4 space-y-1 text-emerald-800 text-xs">
                <li>Non-personalized home decor and gift items in unused, original packaging.</li>
                <li>Products with verified manufacturing defects or transit damage.</li>
                <li>Incorrect item delivered contrasting with invoice.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
              <h4 className="font-bold text-rose-900">Non-Returnable Items:</h4>
              <ul className="list-disc pl-4 space-y-1 text-rose-800 text-xs">
                <li>Customized & personalized gifts manufactured specifically for the user.</li>
                <li>Perishable items (fresh flowers, cakes, sweets).</li>
                <li>Items with missing original tags, packaging, or accessories.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Damaged / Incorrect Product 5-Step Process */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Damaged or Incorrect Product Resolution</h2>
          <p className="text-xs text-slate-500">Follow these 5 steps if you receive a damaged, defective, or incorrect item</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[
            { step: '1', title: 'Contact Support', desc: 'Contact customer support as soon as possible after delivery.' },
            { step: '2', title: 'Provide Order Details', desc: 'Share your Order ID and registered contact information.' },
            { step: '3', title: 'Submit Media Proof', desc: 'Provide clear photographs or unboxing video of the parcel.' },
            { step: '4', title: 'Explain the Issue', desc: 'Explain the defect or damage clearly to our support team.' },
            { step: '5', title: 'Resolution', desc: 'Wait for the support team’s verification and resolution update.' }
          ].map((s) => (
            <div key={s.step} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-neutral-950 font-extrabold text-sm flex items-center justify-center mx-auto">
                {s.step}
              </div>
              <h3 className="font-bold text-xs text-slate-900">{s.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Refunds Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <CreditCard className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl font-bold text-slate-900">Refund Processing</h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Upon approval of a return or valid cancellation, refunds are initiated back to the original payment source (credit card, debit card, net banking, or UPI).
          </p>
          <p>
            The expected processing period typically ranges between <strong>5 to 7 business days</strong>, subject to bank and payment gateway processing timelines.
          </p>
          <p className="text-xs text-slate-500">
            For Cash on Delivery orders, eligible refunds are processed via secure direct bank transfer upon providing verified account details.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CancellationReturnsPage;
