import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import { Sparkles, Layers, Box, Cpu, ArrowRight, Eye, Lightbulb, CheckCircle2 } from 'lucide-react';

const STUDIO_SECTIONS = [
  {
    title: '3D Products',
    desc: 'Precision crafted optical illusion lamps, 3D architectural models, and custom decorative structures.',
    icon: Box
  },
  {
    title: 'Personalized Designs',
    desc: 'Custom engraved names, couple silhouettes, photo etching, and personalized milestone plaques.',
    icon: Sparkles
  },
  {
    title: 'Creative Services',
    desc: '3D CAD modeling, custom acrylic fabrication, and high-detail laser cutting for bespoke gift concepts.',
    icon: Lightbulb
  },
  {
    title: 'Custom Projects',
    desc: 'Specialized commissions for corporate trophies, branded event installations, and mementos.',
    icon: Layers
  }
];

const Studio3DPage = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['studio3DProducts'],
    queryFn: async () => {
      try {
        const res = await API.get('/products');
        const list = res.data.products || [];
        return list.filter(p =>
          p.categoryName?.toLowerCase().includes('3d') ||
          p.name?.toLowerCase().includes('3d') ||
          p.name?.toLowerCase().includes('mandir') ||
          p.name?.toLowerCase().includes('lamp') ||
          p.name?.toLowerCase().includes('acrylic')
        );
      } catch {
        return [];
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Shri Maruti 3D Studio - Personalized 3D Creations & Art"
        description="Shri Maruti 3D Studio represents the creative and 3D-focused side of the Shri Maruti group. Explore personalized designs and 3D creations."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Group Companies</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Shri Maruti 3D Studio</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-neutral-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 shadow-xl border border-neutral-800 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
          <Cpu className="w-3.5 h-3.5" />
          <span>Creative & 3D Engineering</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Shri Maruti 3D Studio
        </h1>
        <p className="text-slate-200 text-sm sm:text-base max-w-3xl leading-relaxed">
          Shri Maruti 3D Studio represents the creative and 3D-focused side of the Shri Maruti group.
        </p>
        <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          The studio can showcase creative products, personalized designs, 3D creations, and other design-oriented services where available.
        </p>
        <div className="pt-2">
          <Link
            to="/products?category=3d-designs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md"
          >
            Explore 3D Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Studio Capabilities & Sections */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Studio Focus & Creative Capabilities</h2>
          <p className="text-xs text-slate-500">Combining modern digital fabrication with artisanal assembly</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {STUDIO_SECTIONS.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div key={idx} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">{sec.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{sec.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Available 3D Products in Database */}
      {products.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Featured 3D Studio Creations</h2>
              <p className="text-xs text-slate-500">Available products in current catalog</p>
            </div>
            <Link to="/products?category=3d-designs" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All 3D Items <ArrowRight className="w-3.5 h-3.5" />
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
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Have a Custom 3D Design or Trophy Project?</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          We collaborate with individuals, institutions, and businesses to prototype and fabricate custom acrylic lamps, awards, and personalized 3D art.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/products"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            Explore 3D Studio
          </Link>
          <Link
            to="/corporate-bulk-gifting"
            className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl shadow-sm transition"
          >
            Custom Project Inquiry
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Studio3DPage;
