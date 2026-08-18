import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import { Sparkles, Flower2, Heart, Calendar, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

const FLORA_CATEGORIES = [
  { name: 'Flower Bouquets', desc: 'Handcrafted fresh floral stems & curated wraps' },
  { name: 'Floral Arrangements', desc: 'Tabletop vases & decorative floral styling' },
  { name: 'Birthday Flowers', desc: 'Vibrant celebratory blooms for birthdays' },
  { name: 'Anniversary Flowers', desc: 'Romantic roses & elegant combinations' },
  { name: 'Celebration Flowers', desc: 'Bright arrangements for milestones and achievements' },
  { name: 'Festive Flowers', desc: 'Traditional auspicious blossoms & festival sets' },
  { name: 'Custom Floral Orders', desc: 'Bespoke floral styling for events and corporate functions' }
];

const FloraPage = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['floraProducts'],
    queryFn: async () => {
      try {
        const res = await API.get('/products');
        const list = res.data.products || [];
        // Filter floral or related items
        return list.filter(p => 
          p.categoryName?.toLowerCase().includes('flower') || 
          p.categoryName?.toLowerCase().includes('flora') ||
          p.name?.toLowerCase().includes('flower') ||
          p.name?.toLowerCase().includes('vase')
        );
      } catch {
        return [];
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Shri Maruti Flora - Fresh Floral Gifting & Arrangements"
        description="Shri Maruti Flora focuses on floral gifting and arrangements designed for celebrations, occasions, and thoughtful moments."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Group Companies</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Shri Maruti Flora</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-neutral-900 via-rose-950 to-slate-900 text-white p-8 sm:p-14 shadow-xl border border-neutral-800 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full border border-rose-500/30">
          <Flower2 className="w-3.5 h-3.5" />
          <span>Floral Gifting & Arrangements</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Shri Maruti Flora
        </h1>
        <p className="text-slate-200 text-sm sm:text-base max-w-3xl leading-relaxed">
          Shri Maruti Flora focuses on floral gifting and arrangements designed for celebrations, occasions, and thoughtful moments.
        </p>
        <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Explore floral products and arrangements suitable for different occasions.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md"
          >
            Explore Shri Maruti Flora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Floral Categories Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Floral Arrangements & Collections</h2>
          <p className="text-xs text-slate-500">Thoughtfully styled for every emotion and celebration</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FLORA_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-rose-300 transition">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Flower2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products Showcase from Database */}
      {products.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Available Floral Gifts & Decor</h2>
              <p className="text-xs text-slate-500">Live products currently in stock</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              View All Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-200 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Need Custom Floral Decor or Bulk Arrangements?</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Contact our team for specialized floral gifting, celebration setups, and event arrangements.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/products"
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            Explore Shri Maruti Flora
          </Link>
          <Link
            to="/corporate-bulk-gifting"
            className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl shadow-sm transition"
          >
            Corporate Floral Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FloraPage;
