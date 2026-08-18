import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { Sparkles, Heart, Target, Compass, Award, ShieldCheck, Truck, Users, Gift, ArrowRight } from 'lucide-react';
import companyConfig from '../config/companyConfig';

const AboutUsPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="About Us - Shri Maruti"
        description="Learn about Shri Maruti's mission, vision, and curated gifting experiences designed for personal celebrations, corporate gifting, and memorable moments."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">About Us</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-slate-900 to-amber-950 text-white p-8 sm:p-14 shadow-xl border border-neutral-800">
        <div className="max-w-3xl space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Gifting & Celebrations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            About Shri Maruti
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Shri Maruti is built around the idea of making meaningful gifting, celebrations, and thoughtful experiences easier to discover and deliver.
          </p>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Our platform brings together carefully curated products and services designed for personal celebrations, special occasions, corporate gifting, and memorable moments.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-sm rounded-xl transition duration-200 shadow-md"
            >
              Explore Our Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        {/* Subtle decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Core Philosophy Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="max-w-3xl space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
          <p>
            We aim to combine convenience, quality, creativity, and dependable service through a seamless digital experience.
          </p>
          <p>
            From everyday celebrations to important milestones, Shri Maruti is designed to help customers find something meaningful for every occasion.
          </p>
        </div>
      </section>

      {/* Mission & Vision Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our mission is to make gifting and celebration experiences simple, reliable, and memorable.
            </p>
            <div className="pt-2 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">We Focus On:</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Quality products and services</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Convenient online ordering</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Reliable delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Thoughtful presentation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Customer-first service</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Continuous innovation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Vision Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              To build a trusted destination for gifting, celebrations, creative experiences, and premium products while continuously improving the customer experience through technology and innovation.
            </p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
            Every step we take is driven by dedication to craftsmanship, timely logistics, and creating joyful moments for families, friends, and businesses across India.
          </div>
        </div>
      </section>

      {/* Why Choose Shri Maruti? */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Why Choose Shri Maruti?</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Thoughtful curation and modern technology working together to deliver excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <Gift className="w-7 h-7 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Curated Products & Experiences</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Carefully selected items and bespoke collections suited for every occasion.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <Sparkles className="w-7 h-7 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Convenient Online Ordering</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Smooth, frictionless browsing and checkout experience across mobile and desktop.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <Truck className="w-7 h-7 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Reliable Delivery Options</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Fast order processing and dependable doorstep delivery across supported locations.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <Users className="w-7 h-7 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Customer-Focused Support</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Dedicated assistance to guide your orders, customization, and inquiries.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <Award className="w-7 h-7 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Premium Presentation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Meticulous packaging and elegant finishing designed to delight upon unboxing.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <Heart className="w-7 h-7 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Multiple Gifting Categories</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Extensive choice spanning florals, bakery, personalized 3D art, and luxury hampers.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 sm:col-span-2">
            <ShieldCheck className="w-7 h-7 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Growing Group of Specialized Businesses</h3>
            <p className="text-xs text-slate-500 leading-relaxed">From Shri Maruti Flora to 3D Studio, Bakes, and Luxe, our specialized divisions bring deep domain passion to every category.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-lg border border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Discover Meaningful Gifts?</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Explore our handcrafted gifts, 3D collections, festive hampers, and personalized keepsakes.
        </p>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-sm rounded-xl transition duration-200 shadow-md"
          >
            Explore Our Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
