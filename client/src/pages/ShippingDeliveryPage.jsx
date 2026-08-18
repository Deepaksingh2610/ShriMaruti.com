import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { Truck, MapPin, Clock, AlertTriangle, ShieldCheck, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';

const ShippingDeliveryPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Express Shipping & Delivery - Shri Maruti"
        description="Learn about Shri Maruti's delivery options, PIN code serviceability, address requirements, and shipping policies."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Help</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Express Shipping & Delivery</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <Truck className="w-3.5 h-3.5" />
          <span>Fulfillment & Logistics</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Express Shipping & Delivery
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          We understand that timely delivery is an important part of a great gifting experience.
        </p>
        <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Shri Maruti works to process and deliver orders according to the delivery option available for the selected product and location.
        </p>
      </div>

      {/* Delivery Information Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Delivery Information</h2>
          <p className="text-xs text-slate-500 mt-1">Key parameters to verify before confirming your order</p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Before placing an order, customers should check the following details presented on the product and checkout pages:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block">Product Availability</strong>
                <span className="text-slate-500 text-xs">Stock levels and manufacturing readiness for personalized items.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block">Delivery Location</strong>
                <span className="text-slate-500 text-xs">PIN code serviceability and local courier coverage.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block">Available Delivery Slot</strong>
                <span className="text-slate-500 text-xs">Standard or express scheduling options where supported.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block">Estimated Delivery Date / Time</strong>
                <span className="text-slate-500 text-xs">Projected transit schedule computed at checkout.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 sm:col-span-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block">Applicable Delivery Charges</strong>
                <span className="text-slate-500 text-xs">Any standard or express shipping fee itemized clearly prior to payment.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Detection & Address Verification */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Navigation className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Location Detection</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The website may use device location and PIN code information to determine available delivery services in your area.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Users should verify their delivery address and postal PIN code before placing an order to avoid routing delays.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Delivery Address Accuracy</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Customers are responsible for providing a complete and accurate delivery address including:
          </p>
          <ul className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
            <li className="flex items-center gap-1.5">• Recipient Name</li>
            <li className="flex items-center gap-1.5">• Phone Number</li>
            <li className="flex items-center gap-1.5">• House / Building No.</li>
            <li className="flex items-center gap-1.5">• Street / Area</li>
            <li className="flex items-center gap-1.5">• City & State</li>
            <li className="flex items-center gap-1.5">• PIN Code</li>
            <li className="flex items-center gap-1.5 col-span-2">• Landmark (where required)</li>
          </ul>
        </div>
      </section>

      {/* Delivery Delays & External Factors */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl font-bold text-slate-900">Delivery Delays & Operational Circumstances</h2>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
          <p>
            While our logistics network works diligently to meet estimated timelines, delivery schedules may be affected by circumstances beyond direct operational control, including:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {[
              'Severe weather conditions',
              'Local traffic restrictions',
              'Public & national holidays',
              'Incorrect / incomplete address',
              'Recipient unavailability at doorstep',
              'Raw material / product availability',
              'Courier operational circumstances'
            ].map((factor, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span>{factor}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 pt-2">
            In case of unexpected delays, our tracking system and customer support team will assist with updated transit information.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ShippingDeliveryPage;
