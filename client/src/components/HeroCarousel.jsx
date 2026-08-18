import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const defaultBanners = [
  {
    id: 1,
    title: 'Send Love Across Distances',
    subtitle: 'Explore Same-Day Express Delivery of Fresh Flowers & Decadent Cakes',
    ctaText: 'Order Fresh Flowers & Cakes',
    link: '/products?category=flowers',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1400&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Personalised Keepsakes That Last Forever',
    subtitle: 'Custom Engraved Spotify Plaques, Photo Frames & Illuminated 3D Mandirs',
    ctaText: 'Explore Personalised Gifts',
    link: '/products?category=personalised',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1400&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Festive Luxury Hampers',
    subtitle: 'Curated Gourmet Treat Baskets, Premium Dry Fruits & Exotic Chocolates',
    ctaText: 'Shop Gift Hampers',
    link: '/products?category=hampers',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1400&auto=format&fit=crop'
  }
];

const HeroCarousel = ({ banners = defaultBanners }) => {
  const slideList = banners.length > 0 ? banners : defaultBanners;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-xl my-4">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        className="w-full h-[340px] sm:h-[420px] lg:h-[480px]"
      >
        {slideList.map((slide) => (
          <SwiperSlide key={slide.id || slide._id}>
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent flex items-center">
                <div className="max-w-2xl px-6 sm:px-12 text-white">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/90 text-slate-950 text-xs font-extrabold rounded-full uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    Special Express Gifting
                  </div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3 drop-shadow-md">
                    {slide.title}
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-200 mb-6 line-clamp-2 max-w-lg">
                    {slide.subtitle}
                  </p>
                  <Link
                    to={slide.link || '/products'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg hover:shadow-amber-500/25 transition transform hover:-translate-y-0.5"
                  >
                    <span>{slide.ctaText || 'Shop Collection'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
