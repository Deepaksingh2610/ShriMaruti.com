import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import CategoryNav from '../components/CategoryNav';
import { Filter, SlidersHorizontal, PackageX } from 'lucide-react';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [sort, setSort] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(5000);

  // Fetch Products
  const { data, isLoading } = useQuery({
    queryKey: ['productsList', categoryParam, searchParam, sort, maxPrice],
    queryFn: async () => {
      const res = await API.get(`/products?category=${categoryParam}&search=${searchParam}&sort=${sort}&maxPrice=${maxPrice}`);
      return res.data;
    }
  });

  // Fetch Categories for Sidebar Filter
  const { data: categoriesData } = useQuery({
    queryKey: ['categoriesList'],
    queryFn: async () => {
      const res = await API.get('/categories');
      return res.data.categories;
    }
  });

  const products = data ? data.products : [];
  const categories = categoriesData || [];

  return (
    <div className="space-y-6">
      <SEOHead title={categoryParam ? `${categoryParam.toUpperCase()} Gifts` : 'Gifts Catalog'} />
      <CategoryNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 capitalize">
              {categoryParam ? `${categoryParam.replace(/-/g, ' ')} Gifts` : searchParam ? `Search: "${searchParam}"` : 'All Gifting Catalog'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Showing {products.length} curated gifts available for express delivery</p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm cursor-pointer"
            >
              <option value="newest">Sort By: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popularity">Popularity & Rating</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
          
          {/* Sidebar Filters */}
          <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-3 text-sm">
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-600" /> Filter Options
              </span>
              {categoryParam && (
                <button
                  onClick={() => setSearchParams({})}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* Price Slider */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Max Price: <span className="text-amber-600 font-extrabold">₹{maxPrice}</span>
              </label>
              <input
                type="range"
                min="300"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                <span>₹300</span>
                <span>₹5000+</span>
              </div>
            </div>

            {/* Dynamic Category Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">All Categories</h4>
              <div className="space-y-1 text-xs font-medium max-h-[380px] overflow-y-auto pr-1">
                <button
                  onClick={() => setSearchParams({})}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${
                    !categoryParam ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Gifts
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSearchParams({ category: cat.slug })}
                    className={`w-full text-left px-3 py-2 rounded-xl transition ${
                      categoryParam === cat.slug ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-slate-200 h-72 rounded-2xl"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
                <PackageX className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-xl font-bold text-slate-900">No gifts found matching your criteria</h3>
                <p className="text-xs text-slate-500">Try adjusting your filters or price slider</p>
                <button
                  onClick={() => { setSearchParams({}); setMaxPrice(5000); }}
                  className="px-6 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductListPage;
