import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Zap } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId);

  const image = product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop';
  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('Item is currently out of stock');
      return;
    }
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('Item is currently out of stock');
      return;
    }
    addToCart(product, 1);
    navigate('/cart');
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.isBestseller && (
          <span className="bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
            Bestseller
          </span>
        )}
        {product.isLuxe && (
          <span className="bg-slate-900 text-amber-400 border border-amber-400/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
            LUXE
          </span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
            Only {product.stock} left!
          </span>
        )}
        {product.stock <= 0 && (
          <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Out of Stock
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-500 shadow-sm hover:scale-110 transition"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Image Container */}
      <Link to={`/product/${product.slug || productId}`} className="block relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Details Container */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1">
            <div className="flex items-center text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="ml-1">{product.rating || '4.8'}</span>
            </div>
            <span className="text-[11px] text-slate-400">({product.numReviews || 12})</span>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug || productId}`} className="block">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 line-clamp-2 leading-snug transition">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-extrabold text-slate-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
                <span className="text-xs font-bold text-emerald-600">{discountPercent}% OFF</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="py-2 px-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="py-2 px-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
