import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import { Cake, Sparkles, Heart, Gift, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

const BAKES_CATEGORIES = [
  { name: 'Cakes', desc: 'Artisanal celebration cakes baked fresh for birthdays and special milestones.' },
  { name: 'Pastries', desc: 'Single-serve gourmet pastry slices in decadent flavors.' },
  { name: 'Cupcakes', desc: 'Themed and assorted box sets perfect for party favors.' },
  { name: 'Celebration Desserts', desc: 'Festive treats, brownies, and chocolate pairings.' },
  { name: 'Gift Boxes', desc: 'Curated bakery and cookie hampers in elegant gift boxing.' },
  { name: 'Custom Cakes', desc: 'Personalized celebration designs and customized message cakes.' }
];

const BakesPage = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['bakesProducts'],
    queryFn: async () => {
      try {
        const res = await API.get('/products');
        const list = res.data.products || [];
        return list.filter(p =>
          p.categoryName?.toLowerCase().includes('cake') ||
          p.categoryName?.toLowerCase().includes('bake') ||
          p.name?.toLowerCase().includes('cake') ||
          p.name?.toLowerCase().includes('chocolate') ||
          p.name?.toLowerCase().includes('sweet')
        );
      } catch {
        return [];
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Shri Maruti Bakes - Celebration Cakes & Bakery Delights"
        description="Celebrate special moments with thoughtfully prepared baked creations. Explore available bakery products suitable for birthdays, anniversaries, and occasions."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Group Companies</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Shri Maruti Bakes</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-neutral-900 via-amber-950 to-slate-900 text-white p-8 sm:p-14 shadow-xl border border-neutral-800 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <Cake className="w-3.5 h-3.5" />
          <span>Artisanal Bakery & Confectionery</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Shri Maruti Bakes
        </h1>
        <p className="text-slate-200 text-sm sm:text-base max-w-3xl leading-relaxed">
          Celebrate special moments with thoughtfully prepared baked creations.
        </p>
        <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Explore available bakery products suitable for birthdays, anniversaries, celebrations, festivals, gifting, and other occasions.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-md"
          >
            Explore Shri Maruti Bakes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Bakery Categories */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Bakery Specialties</h2>
          <p className="text-xs text-slate-500">Crafted with quality ingredients for unforgettable flavors</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BAKES_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-amber-300 transition">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Cake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Database Products (Only displayed if they exist in actual catalog) */}
      {products.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Available Bakery Products</h2>
              <p className="text-xs text-slate-500">Live products in current catalog</p>
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
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Planning a Milestone Celebration?</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Explore our collection of celebration desserts and gift boxes paired with personalized keepsakes.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-xl shadow-sm transition"
          >
            Explore Shri Maruti Bakes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BakesPage;
