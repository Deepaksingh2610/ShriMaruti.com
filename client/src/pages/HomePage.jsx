import React from 'react';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import HeroCarousel from '../components/HeroCarousel';
import CategoryNav from '../components/CategoryNav';
import BestsellersSection from '../components/BestsellersSection';
import BrandStorySection from '../components/BrandStorySection';
import ProductCard from '../components/ProductCard';
import { Gift, Sparkles, Truck, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  // Fetch Hero Banners
  const { data: bannersData } = useQuery({
    queryKey: ['heroBanners'],
    queryFn: async () => {
      const res = await API.get('/content/banners?type=hero');
      return res.data.banners;
    }
  });

  // Fetch Promo / Pre-Footer Cards
  const { data: promoBannersData } = useQuery({
    queryKey: ['promoBanners'],
    queryFn: async () => {
      const res = await API.get('/content/banners?type=promo');
      return res.data.banners;
    }
  });

  // Fetch Products
  const { data: productsData } = useQuery({
    queryKey: ['homeProducts'],
    queryFn: async () => {
      const res = await API.get('/products?limit=12');
      return res.data.products;
    }
  });

  const banners = bannersData || [];
  const promoCards = promoBannersData || [];
  const products = productsData || [];

  const handlePromoCardClick = (card) => {
    if (card.categorySlug) {
      navigate(`/products?category=${card.categorySlug}`);
    } else if (card.link) {
      navigate(card.link);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="space-y-10">
      <SEOHead title="Home" />
      <CategoryNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Swiper Hero Carousel */}
        <HeroCarousel banners={banners} />

        {/* Feature Value Props Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Same-Day Express</h4>
              <p className="text-[11px] text-slate-500">Fixed time slot delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Fresh Promise</h4>
              <p className="text-[11px] text-slate-500">Handpicked farm blooms</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Free Gift Wrapping</h4>
              <p className="text-[11px] text-slate-500">With custom card message</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">5,000+ Happy Smiles</h4>
              <p className="text-[11px] text-slate-500">Rated 4.9★ nationwide</p>
            </div>
          </div>
        </div>

        {/* Shop By Bestsellers */}
        <BestsellersSection products={products} />

        {/* Trending Gifts Grid */}
        <section className="my-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-amber-600 text-xs font-extrabold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Handpicked Collections</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Trending Gifts For Every Occasion
              </h2>
            </div>
            <Link to="/products" className="text-xs font-bold text-amber-600 hover:text-amber-700 underline">
              View All Gifts →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ── Dynamic Promo Category Cards (Pre-Footer) ──────────── */}
        {promoCards.length > 0 && (
          <section className="my-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-extrabold uppercase tracking-wider mb-1">
                  <Gift className="w-4 h-4" />
                  <span>Shop By Category</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Explore Our Collections
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promoCards.map((card) => (
                <div
                  key={card._id || card.id}
                  onClick={() => handlePromoCardClick(card)}
                  className="group relative rounded-2xl overflow-hidden shadow-md cursor-pointer aspect-[4/3] bg-slate-900 hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-5">
                    <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight mb-1">
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p className="text-xs text-slate-300 mb-3 line-clamp-2">{card.subtitle}</p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300 transition">
                      {card.ctaText || 'Shop Collection'} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Brand Story Section */}
        <BrandStorySection />

      </div>
    </div>
  );
};

export default HomePage;



