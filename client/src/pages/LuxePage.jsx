import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import { Crown, Sparkles, Gift, ShieldCheck, ArrowRight, Award, Gem } from 'lucide-react';

const LUXE_CATEGORIES = [
  { name: 'Premium Gifts', desc: 'Curated high-grade materials, precision craftsmanship, and sophisticated styling.' },
  { name: 'Luxury Gift Sets', desc: 'Complete themed sets enclosed in handcrafted rigid presentation boxes.' },
  { name: 'Premium Hampers', desc: 'Rich combinations of artisanal essentials, premium keepsakes, and celebratory decor.' },
  { name: 'Special Occasion Gifts', desc: 'Bespoke milestone gifts designed for landmark anniversaries and weddings.' },
  { name: 'Corporate Premium Gifts', desc: 'Executive leadership gifting and VIP client hampers tailored for enterprises.' }
];

const LuxePage = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['luxeProducts'],
    queryFn: async () => {
      try {
        const res = await API.get('/products');
        const list = res.data.products || [];
        return list.filter(p =>
          p.price >= 999 ||
          p.categoryName?.toLowerCase().includes('luxe') ||
          p.categoryName?.toLowerCase().includes('hamper') ||
          p.name?.toLowerCase().includes('luxe') ||
          p.name?.toLowerCase().includes('mandir') ||
          p.name?.toLowerCase().includes('frame')
        );
      } catch {
        return [];
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Shri Maruti Luxe - Premium Gifting Experience"
        description="Shri Maruti Luxe represents a premium gifting experience focused on elegant, sophisticated, and thoughtfully curated products."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Group Companies</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Shri Maruti Luxe</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-neutral-950 via-slate-900 to-amber-950 text-white p-8 sm:p-14 shadow-2xl border border-neutral-800 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <Crown className="w-3.5 h-3.5" />
          <span>The Premium Collection</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Shri Maruti Luxe
        </h1>
        <p className="text-slate-200 text-sm sm:text-base max-w-3xl leading-relaxed">
          Shri Maruti Luxe represents a premium gifting experience focused on elegant, sophisticated, and thoughtfully curated products.
        </p>
        <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Discover elevated keepsakes, refined presentation, and memorable gifting designed for exceptional moments.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-md"
          >
            Explore Shri Maruti Luxe
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Luxe Categories */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Luxe Gifting Collections</h2>
          <p className="text-xs text-slate-500">Meticulously curated for elegance and distinction</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {LUXE_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-amber-400 transition">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Gem className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Database Products (Luxe/Premium tier) */}
      {products.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Featured Luxe Selections</h2>
              <p className="text-xs text-slate-500">Premium items in current catalog</p>
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
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 text-center space-y-4 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold">Seeking Bespoke Luxury Gifting?</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Our concierge can assist with tailored hampers, custom luxury finishes, and VIP multi-destination dispatch.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/products"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-xl shadow-sm transition"
          >
            Explore Shri Maruti Luxe
          </Link>
          <Link
            to="/corporate-bulk-gifting"
            className="px-6 py-2.5 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-slate-200 font-bold text-xs rounded-xl shadow-sm transition"
          >
            Executive Gifting Inquiries
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LuxePage;
