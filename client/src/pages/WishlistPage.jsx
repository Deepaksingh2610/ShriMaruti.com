import React from 'react';
import { useWishlistStore } from '../store/useWishlistStore';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const { wishlist } = useWishlistStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SEOHead title="My Wishlist" />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Saved Wishlist ({wishlist.length})</h1>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <Heart className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500">Save items you love by tapping the heart icon on any gift!</p>
          <Link to="/products" className="inline-block px-6 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
