import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductCard from './ProductCard';
import { Sparkles } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';

const bestsellerTabs = [
  { id: 'flowers', label: 'Flowers', icon: '💐' },
  { id: 'cakes', label: 'Cakes', icon: '🎂' },
  { id: 'personalised', label: 'Personalised', icon: '🎁' },
  { id: 'hampers', label: 'Hampers', icon: '🧺' },
  { id: 'chocolates', label: 'Chocolates', icon: '🍫' }
];

const BestsellersSection = ({ products = [] }) => {
  const [activeTab, setActiveTab] = useState('flowers');

  const filteredProducts = products.filter(
    (p) => p.categoryName && p.categoryName.toLowerCase().includes(activeTab.toLowerCase())
  );

  const displayList = filteredProducts.length > 0 ? filteredProducts : products.slice(0, 6);

  return (
    <section className="my-10 bg-gradient-to-b from-sky-50/80 via-blue-50/40 to-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>India's Favourite Choice</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shop By Bestsellers
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Discover curated bestsellers that make every celebration extra special
          </p>
        </div>

        {/* Tab Pills matching Reference Image 4 */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 no-scrollbar">
          {bestsellerTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-md scale-105'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Swiper Slider of Products */}
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1.2}
        navigation={true}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          768: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4.2 }
        }}
        className="pb-4"
      >
        {displayList.map((product) => (
          <SwiperSlide key={product._id || product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default BestsellersSection;
