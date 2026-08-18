import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const categories = [
  { name: 'All Gifts', slug: '' },
  { name: 'Home Decor', slug: 'home-decor' },
  { name: 'Wooden Earrings', slug: 'wooden-earrings' },
  { name: 'Photo Frame', slug: 'photo-frame' },
  { name: 'Home Living Gifts', slug: 'home-living-gifts' },
  { name: 'Home Essentials Gifts', slug: 'home-essentials-gifts' },
  { name: 'Toy & Puzzle', slug: 'toy-and-puzzle' },
  { name: 'Birthday', slug: 'birthday' },
  { name: 'Anniversary', slug: 'anniversary' },
  { name: 'Personalised', slug: 'personalised' },
  { name: 'Occasions', slug: 'occasions' },
  { name: '3D Designs', slug: '3d-designs' },
  { name: '3D Mandir', slug: '3d-mandir' },
  { name: 'Personalised Photos', slug: 'personalised-photos' },
  { name: '3D Cars', slug: '3d-cars' },
  { name: '3D Cartoon', slug: '3d-cartoon' }
];

const CategoryNav = () => {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  return (
    <div className="bg-slate-900 text-white shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-3 no-scrollbar text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <Link
                key={cat.name}
                to={`/products${cat.slug ? `?category=${cat.slug}` : ''}`}
                className={`py-1.5 px-3.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
