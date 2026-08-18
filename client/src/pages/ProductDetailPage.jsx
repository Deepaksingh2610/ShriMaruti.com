import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import SocialShareButtons from '../components/SocialShareButtons';
import ProductCard from '../components/ProductCard';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useLocationStore } from '../store/useLocationStore';
import { Star, ShieldCheck, Truck, Heart, ShoppingBag, Zap, MapPin, CheckCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { deliveryPincode, deliveryCity } = useLocationStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [pincodeCheck, setPincodeCheck] = useState(deliveryPincode);
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['productDetail', slug],
    queryFn: async () => {
      const res = await API.get(`/products/${slug}`);
      return res.data;
    }
  });

  if (isLoading || !data) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 font-medium">Loading gift details...</div>;
  }

  const product = data.product;
  const relatedProducts = data.relatedProducts || [];
  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop'];

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice || product.originalPrice : product.originalPrice;
  const isWishlisted = isInWishlist(product._id || product.id);

  const handlePincodeVerify = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincodeCheck)) {
      toast.error('Enter valid 6-digit Pincode');
      return;
    }
    setPincodeStatus(`Available for Same-Day Express Delivery to ${deliveryCity} (${pincodeCheck})!`);
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Item is out of stock');
      return;
    }
    addToCart(product, qty, selectedVariant);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) {
      toast.error('Item is out of stock');
      return;
    }
    addToCart(product, qty, selectedVariant);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <SEOHead title={product.name} description={product.description} image={images[0]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-500 shadow-md hover:scale-110 transition"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-amber-600 scale-95 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 text-amber-900 font-extrabold text-[11px] uppercase px-3 py-1 rounded-full">
                {product.categoryName || 'Gifts'}
              </span>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="bg-rose-500 text-white font-bold text-[11px] px-3 py-1 rounded-full animate-pulse">
                  Hurry! Only {product.stock} items left
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="ml-1.5">{product.rating || 4.8}</span>
              </div>
              <span className="text-xs text-slate-500">Based on {product.numReviews || 12} verified buyer reviews</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-baseline gap-4">
            <span className="text-3xl font-black text-slate-900">₹{currentPrice}</span>
            {currentOriginalPrice > currentPrice && (
              <>
                <span className="text-base text-slate-400 line-through">₹{currentOriginalPrice}</span>
                <span className="text-sm font-extrabold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  {Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Select Variant Option:</h4>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                      selectedVariant && selectedVariant.name === v.name
                        ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {v.name} (₹{v.price})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pincode Serviceability Check */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Check Delivery Date & Serviceability</span>
            </div>
            <form onSubmit={handlePincodeVerify} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeCheck}
                onChange={(e) => setPincodeCheck(e.target.value)}
                placeholder="Enter Pincode"
                className="px-3 py-2 text-xs border border-amber-300 rounded-xl bg-white outline-none w-36 font-bold"
              />
              <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm">
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-2">
                <CheckCircle className="w-4 h-4" /> {pincodeStatus}
              </p>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                >-</button>
                <span className="px-4 py-1.5 text-xs font-bold text-slate-900">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                >+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 transition"
              >
                <Zap className="w-4 h-4 fill-white" /> Buy Now
              </button>
            </div>
          </div>

          {/* Why Buy This Section */}
          {product.whyBuy && product.whyBuy.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Why Choose This Gift?</h4>
              <ul className="space-y-1 text-xs text-slate-600">
                {product.whyBuy.map((point, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 🛡️ Return & Refund Policy Information */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {product.policyType || 'Return'} Policy
              </span>
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                {product.returnPolicyDays ?? 7} Days Guarantee
              </span>
            </div>
            <p className="text-emerald-800 text-[11px] font-medium leading-relaxed">
              {product.policyTerms || `Eligible for ${product.policyType || 'Return'} within ${product.returnPolicyDays ?? 7} days of delivery if undamaged with original packaging.`}
            </p>
          </div>

          {/* Social Share Buttons */}
          <SocialShareButtons title={product.name} />

        </div>

      </div>

      {/* Description & Reviews */}
      <div className="border-t border-slate-200 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Product Description</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>

        {/* Buyer Reviews Summary */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" /> Buyer Reviews
            </h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
              4.9 ★ (12)
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Priya Sharma</span>
                <span className="text-amber-500">★★★★★</span>
              </div>
              <p className="text-slate-600">"Super fast delivery in Lucknow! The orchid flowers were extremely fresh and beautifully wrapped."</p>
              <span className="text-[10px] text-slate-400">Verified Purchase</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Rohan Verma</span>
                <span className="text-amber-500">★★★★★</span>
              </div>
              <p className="text-slate-600">"The personalized Spotify frame LED light base is top quality. My wife loved it!"</p>
              <span className="text-[10px] text-slate-400">Verified Purchase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Rail */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-slate-200">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Frequently Bought Together</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel._id || rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetailPage;
