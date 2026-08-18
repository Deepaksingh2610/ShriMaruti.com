import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import { ShoppingBag, Trash2, Gift, Tag, ArrowRight, ShieldCheck, Truck, Sparkles, CheckCircle2, Percent, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    cartItems, updateQty, removeFromCart, getItemsTotal,
    isGiftWrapped, giftMessage, setGiftOptions,
    appliedCoupon, setAppliedCoupon,
    appliedGiftCard, setAppliedGiftCard,
    usedLoyaltyPoints, setUsedLoyaltyPoints
  } = useCartStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [giftCardInput, setGiftCardInput] = useState('');
  const [loyaltyInput, setLoyaltyInput] = useState(0);

  const itemsTotal = getItemsTotal();
  const giftWrapFee = isGiftWrapped ? 49 : 0;
  const deliveryFee = itemsTotal >= 499 || itemsTotal === 0 ? 0 : 70;

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const giftCardDiscount = appliedGiftCard ? Math.min(appliedGiftCard.balance, itemsTotal + giftWrapFee + deliveryFee - couponDiscount) : 0;
  const loyaltyDiscount = usedLoyaltyPoints;

  const finalTotal = Math.max(0, itemsTotal + giftWrapFee + deliveryFee - couponDiscount - giftCardDiscount - loyaltyDiscount);

  // ── Fetch Public Coupons created by Admin ──────────────────────────────
  const { data: publicCouponsData } = useQuery({
    queryKey: ['publicCoupons'],
    queryFn: async () => {
      const res = await API.get('/content/public-coupons');
      return res.data;
    }
  });

  const availableCoupons = publicCouponsData?.coupons || [];

  const handleApplyCouponCode = async (codeToValidate) => {
    try {
      const res = await API.post('/content/coupons/validate', { code: codeToValidate, orderAmount: itemsTotal });
      if (res.data.success) {
        setAppliedCoupon({ code: res.data.couponCode, discount: res.data.discount });
        setCouponCodeInput(res.data.couponCode);
        toast.success(`Coupon "${res.data.couponCode}" applied! Saved ₹${res.data.discount}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    handleApplyCouponCode(couponCodeInput);
  };

  const handleApplyGiftCard = async (e) => {
    e.preventDefault();
    if (!giftCardInput.trim()) return;
    try {
      const res = await API.post('/giftcards/validate', { code: giftCardInput });
      if (res.data.success) {
        setAppliedGiftCard({ code: res.data.code, balance: res.data.balance });
        toast.success(`Gift card applied! Balance: ₹${res.data.balance}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid gift card code');
    }
  };

  // Loyalty points calculation rules
  const userBalance = user?.loyaltyPoints || 0;
  const maxAllowedLoyalty = Math.min(userBalance, itemsTotal);

  const handleLoyaltyInputChange = (val) => {
    const num = Math.max(0, Math.min(Number(val) || 0, maxAllowedLoyalty));
    setLoyaltyInput(num);
  };

  const handleApplyLoyalty = () => {
    if (loyaltyInput <= 0) {
      setUsedLoyaltyPoints(0);
      toast.success('Loyalty points cleared');
      return;
    }
    setUsedLoyaltyPoints(loyaltyInput);
    toast.success(`Applied ${loyaltyInput} loyalty points (₹${loyaltyInput} off)!`);
  };

  const handleUseMaxLoyalty = () => {
    if (maxAllowedLoyalty <= 0) {
      toast.error('No loyalty points available to redeem');
      return;
    }
    setLoyaltyInput(maxAllowedLoyalty);
    setUsedLoyaltyPoints(maxAllowedLoyalty);
    toast.success(`Applied max ${maxAllowedLoyalty} points (₹${maxAllowedLoyalty} off)!`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <SEOHead title="Shopping Cart" />
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Your Shopping Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Explore our collection of fresh flowers, cakes, scannable Spotify frames, 3D mandirs, and luxury hampers!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-lg transition"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead title="Shopping Cart" />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Cart Line Items & Gifting Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cart Items List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                    {item.variantName && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
                        Variant: {item.variantName}
                      </span>
                    )}
                    <div className="text-sm font-extrabold text-slate-900 mt-1">₹{item.price}</div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => updateQty(item.product, item.qty - 1, item.variantName)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                      >-</button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-900">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.product, item.qty + 1, item.variantName)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                      >+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product, item.variantName)}
                      className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gift Customization Options */}
          <div className="bg-amber-50/70 rounded-3xl border border-amber-200/80 p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Gift className="w-5 h-5 text-amber-600" />
              <span>Gifting Options & Personalization</span>
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-white p-3.5 rounded-2xl border border-amber-200 shadow-sm">
              <input
                type="checkbox"
                checked={isGiftWrapped}
                onChange={(e) => setGiftOptions(e.target.checked, giftMessage)}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Add Premium Velvet Gift Wrapping (+₹49)</span>
                <span className="text-[11px] text-slate-500 block">Includes elegant gift paper wrap & satin bow ribbon</span>
              </div>
            </label>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Personalized Gift Card Message (Included Free)
              </label>
              <textarea
                rows={2}
                value={giftMessage}
                onChange={(e) => setGiftOptions(isGiftWrapped, e.target.value)}
                placeholder="Write your special message for the recipient (e.g., Happy Birthday Mom! Wish you all the happiness...)"
                className="w-full p-3 text-xs border border-amber-300 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

        </div>

        {/* Right Col: Order Bill Summary & Coupon/Discounts */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">Bill Summary</h3>

            {/* 🏷️ Available Coupons Cards Section */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Percent className="w-4 h-4 text-amber-600" /> Available Coupons & Offers
              </label>

              {availableCoupons.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {availableCoupons.map((c) => {
                    const isEligible = itemsTotal >= c.minOrderValue;
                    const isAlreadyApplied = appliedCoupon?.code === c.code;
                    const amountNeeded = c.minOrderValue - itemsTotal;

                    return (
                      <div
                        key={c.code}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          isAlreadyApplied
                            ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                            : isEligible
                            ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white border-amber-500/50 shadow-md hover:border-amber-400'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${
                              isAlreadyApplied ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-500 text-slate-950'
                            }`}>
                              {c.code}
                            </span>
                            <span className={`text-xs font-extrabold ${isAlreadyApplied ? 'text-emerald-800' : isEligible ? 'text-amber-300' : 'text-slate-500'}`}>
                              {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                            </span>
                          </div>
                          <p className={`text-[10px] ${isAlreadyApplied ? 'text-emerald-700' : isEligible ? 'text-slate-300' : 'text-slate-400'}`}>
                            Min. order ₹{c.minOrderValue} {c.maxDiscount ? `· Max discount ₹${c.maxDiscount}` : ''}
                          </p>
                        </div>

                        <div>
                          {isAlreadyApplied ? (
                            <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2.5 py-1 rounded-xl">
                              ✓ Applied
                            </span>
                          ) : isEligible ? (
                            <button
                              type="button"
                              onClick={() => handleApplyCouponCode(c.code)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition active:scale-95 shadow-xs"
                            >
                              Apply
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-lg block text-right">
                              Add ₹{amountNeeded} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">No promo coupons active currently</p>
              )}

              {/* Manual Coupon Input Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-600 block">Have another coupon code?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="Enter code (e.g. WELCOME10)"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none uppercase font-bold"
                  />
                  <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl">
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <span className="text-[11px] text-emerald-600 font-bold block">✓ Active: "{appliedCoupon.code}" (-₹{appliedCoupon.discount})</span>
                )}
              </form>
            </div>

            {/* Gift Card Input */}
            <form onSubmit={handleApplyGiftCard} className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-amber-600" /> Redeem Gift Card Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={giftCardInput}
                  onChange={(e) => setGiftCardInput(e.target.value)}
                  placeholder="e.g. GIFT-XXXXXXXX"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none uppercase font-bold"
                />
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl">
                  Redeem
                </button>
              </div>
              {appliedGiftCard && (
                <span className="text-[11px] text-emerald-600 font-bold block">✓ Gift Card active (Balance: ₹{appliedGiftCard.balance})</span>
              )}
            </form>

            {/* ⭐ Loyalty Points Redemption (Strict min 0, max cap, Max button) */}
            {user && userBalance > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1 text-amber-900">
                    <Coins className="w-4 h-4 text-amber-600 fill-amber-600" /> Redeem Loyalty Points
                  </span>
                  <span className="bg-amber-200 text-amber-900 font-black text-[10px] px-2 py-0.5 rounded-full">
                    Balance: {userBalance} pts (₹{userBalance})
                  </span>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={0}
                    max={maxAllowedLoyalty}
                    value={loyaltyInput}
                    onChange={(e) => handleLoyaltyInputChange(e.target.value)}
                    placeholder="Points to use"
                    className="flex-1 px-3 py-2 text-xs border border-amber-300 rounded-xl outline-none font-extrabold text-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleUseMaxLoyalty}
                    className="px-3 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl transition"
                    title="Use maximum available points"
                  >
                    Max ({maxAllowedLoyalty})
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyLoyalty}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl transition"
                  >
                    Apply
                  </button>
                </div>
                {usedLoyaltyPoints > 0 && (
                  <span className="text-[11px] text-emerald-700 font-extrabold block">
                    ✓ Using {usedLoyaltyPoints} points (-₹{usedLoyaltyPoints} off)
                  </span>
                )}
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-4 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Item Subtotal</span>
                <span className="font-bold text-slate-900">₹{itemsTotal}</span>
              </div>

              {isGiftWrapped && (
                <div className="flex justify-between text-slate-600">
                  <span>Gift Wrap Fee</span>
                  <span className="font-bold text-slate-900">+₹49</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Express Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600 uppercase">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              {giftCardDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Gift Card Balance Used</span>
                  <span>-₹{giftCardDiscount}</span>
                </div>
              )}

              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Loyalty Discount</span>
                  <span>-₹{loyaltyDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Pay Amount</span>
                <span className="text-amber-700">₹{finalTotal}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CartPage;
