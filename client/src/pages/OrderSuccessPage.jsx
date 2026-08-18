import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import { CheckCircle2, Truck, MapPin, Phone, Mail, FileText, Gift, Sparkles, ShoppingBag, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderId } = useParams();

  // Fetch current order details
  const { data: order } = useQuery({
    queryKey: ['orderSuccess', orderId],
    queryFn: async () => {
      const res = await API.get(`/orders/${orderId}`);
      return res.data.order;
    },
    enabled: !!orderId
  });

  // Fetch Trending & Bestseller products for recommendation rail
  const { data: recommendationsData } = useQuery({
    queryKey: ['orderSuccessRecommendations'],
    queryFn: async () => {
      const res = await API.get('/products?limit=8');
      return res.data.products || [];
    }
  });

  const recommendedProducts = recommendationsData || [];

  // Calculate estimated delivery date (3 to 5 business days from order creation)
  const getEstimatedDeliveryDate = (createdAt) => {
    const baseDate = createdAt ? new Date(createdAt) : new Date();
    const estStart = new Date(baseDate);
    estStart.setDate(estStart.getDate() + 3);
    const estEnd = new Date(baseDate);
    estEnd.setDate(estEnd.getDate() + 5);

    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${estStart.toLocaleDateString('en-IN', options)} - ${estEnd.toLocaleDateString('en-IN', options)}`;
  };

  const formattedRecipientPhone = (phone) => {
    if (!phone) return '—';
    return phone.startsWith('+91') ? phone : `+91 ${phone}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SEOHead title="Order Confirmed & Placed Successfully!" />

      {/* ── SUCCESS HERO BANNER ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border-2 border-white/40 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-amber-200 bg-amber-900/30 px-3 py-1 rounded-full inline-block">
            Order Confirmed & Placed
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Thank You! Your Order is Complete 🎉
          </h1>
          {order && (
            <p className="text-xs sm:text-sm text-amber-100 font-medium">
              Order ID: <strong className="text-white">#{order.orderNumber}</strong> · Invoice emailed to <strong className="text-white">{order.senderDetails?.email}</strong>
            </p>
          )}
        </div>

        {/* Quick Action Badges */}
        {order && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border backdrop-blur-sm ${
              order.paymentStatus === 'Paid' || order.paymentStatus === 'CONFIRMED'
                ? 'bg-emerald-500/30 border-emerald-300/50 text-emerald-100'
                : order.paymentStatus === 'PENDING_VERIFICATION'
                ? 'bg-amber-900/60 border-amber-300/60 text-amber-100'
                : 'bg-rose-900/60 border-rose-300/60 text-rose-100'
            }`}>
              {order.paymentMethod === 'COD'
                ? '💵 Cash on Delivery (COD)'
                : order.paymentMethod === 'UPI'
                ? `📱 Direct UPI — Status: ${order.paymentStatus}`
                : '💳 Online Paid via Razorpay ✓'}
            </span>

            <button
              onClick={() => window.print()}
              className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/40 text-white flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" /> Print Tax Invoice
            </button>
          </div>
        )}
      </div>

      {order && order.paymentMethod === 'UPI' && (
        <div className={`rounded-3xl p-6 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          order.paymentStatus === 'CONFIRMED'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : order.paymentStatus === 'REJECTED'
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
              <h3 className="text-base font-black">
                {order.paymentStatus === 'CONFIRMED'
                  ? '🎉 Payment Verified Successfully!'
                  : order.paymentStatus === 'REJECTED'
                  ? '❌ Payment Verification Failed'
                  : '⏳ Payment Verification Pending'}
              </h3>
            </div>
            <p className="text-xs font-medium opacity-90">
              {order.paymentStatus === 'CONFIRMED'
                ? 'Your UPI payment proof has been verified and your order is confirmed.'
                : order.paymentStatus === 'REJECTED'
                ? 'Your payment proof was rejected. Please check your transaction details or contact support.'
                : 'Your payment proof has been submitted. Your order will be confirmed within a few minutes after admin verification.'}
            </p>
          </div>
          {order.paymentProof?.utrNumber && (
            <div className="bg-white/90 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-mono font-bold flex-shrink-0">
              UTR: {order.paymentProof.utrNumber}
            </div>
          )}
        </div>
      )}

      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT 2 COLS: DELIVERY STATUS & ORDERED ITEMS ──────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* 🚚 Estimated Delivery Banner & Shipment Details */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Estimated Delivery Date</span>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {getEstimatedDeliveryDate(order.createdAt)}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80">
                  <Clock className="w-4 h-4" /> Status: <span className="text-slate-900 font-extrabold">{order.orderStatus}</span>
                </div>
              </div>

              {/* Order Status Progress Tracker */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Shipment Progress</span>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                  <div className="bg-amber-600 text-white p-2 rounded-xl">1. Placed ✓</div>
                  <div className={`p-2 rounded-xl ${['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus) ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2. Confirmed</div>
                  <div className={`p-2 rounded-xl ${['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus) ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3. Shipped</div>
                  <div className={`p-2 rounded-xl ${order.orderStatus === 'Delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>4. Delivered</div>
                </div>
              </div>

              {/* Delivery Address Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Shipping To:</span>
                <p className="font-extrabold text-slate-900 text-sm">{order.shippingAddress?.fullName || order.senderDetails?.name}</p>
                <p className="text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <strong>{formattedRecipientPhone(order.shippingAddress?.phone || order.senderDetails?.phone)}</strong>
                </p>
                <p className="text-slate-600 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    {order.shippingAddress?.street}, {order.shippingAddress?.landmark ? `${order.shippingAddress.landmark}, ` : ''}
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} — <strong>{order.shippingAddress?.pincode}</strong>
                  </span>
                </p>
              </div>
            </div>

            {/* 🎁 Ordered Items List */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Ordered Items ({order.orderItems?.length || 0})</span>
                <span className="text-xs font-semibold text-slate-500">Order #{order.orderNumber}</span>
              </h3>

              <div className="divide-y divide-slate-100">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                        {item.variantName && <p className="text-[11px] text-amber-700 font-semibold">{item.variantName}</p>}
                        <p className="text-slate-500">Qty: {item.qty} × ₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Personalized Gift Message Banner */}
              {(order.giftOptions?.giftMessage || order.giftOptions?.isGiftWrapped) && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-amber-600" /> Personalized Gift Customization
                    </span>
                    {order.giftOptions?.isGiftWrapped && (
                      <span className="bg-amber-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Velvet Wrapped (+₹49)
                      </span>
                    )}
                  </div>
                  {order.giftOptions?.giftMessage && (
                    <p className="text-slate-800 italic bg-white p-3 rounded-xl border border-amber-200 text-xs">
                      "{order.giftOptions.giftMessage}"
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT COL: BILLING SUMMARY & NAVIGATION BUTTONS ────────────── */}
          <div className="space-y-6">

            {/* Price Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Payment Summary</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">₹{order.pricing?.itemsTotal?.toLocaleString('en-IN')}</span>
                </div>

                {order.pricing?.giftWrapFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Gift Wrap Fee</span>
                    <span className="font-bold text-slate-900">+₹{order.pricing.giftWrapFee}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-emerald-600">
                    {order.pricing?.deliveryFee === 0 ? 'FREE' : `+₹${order.pricing?.deliveryFee}`}
                  </span>
                </div>

                {order.pricing?.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount ({order.couponCode})</span>
                    <span className="font-bold">-₹{order.pricing.couponDiscount}</span>
                  </div>
                )}

                {order.pricing?.giftCardDiscount > 0 && (
                  <div className="flex justify-between text-indigo-700 font-medium">
                    <span>Gift Card Redemed</span>
                    <span className="font-bold">-₹{order.pricing.giftCardDiscount}</span>
                  </div>
                )}

                {order.pricing?.loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Loyalty Coins Discount ({order.loyaltyPointsUsed} pts)</span>
                    <span className="font-bold">-₹{order.pricing.loyaltyDiscount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-900">Total Paid</span>
                  <span className="text-amber-700 text-xl">₹{order.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  to="/orders"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Truck className="w-4 h-4" /> Track Order Status
                </Link>

                <button
                  onClick={() => window.print()}
                  className="w-full py-3 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 transition"
                >
                  <FileText className="w-4 h-4 text-slate-500" /> Print Tax Invoice
                </button>
              </div>
            </div>

            {/* Buyer Trust Box */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl space-y-2 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Guaranteed Delivery & Support</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Need help with your order? Call our helpline at <strong>1800-419-7700</strong> or chat on WhatsApp 24x7.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ── RECOMMENDED TRENDING & BESTSELLER PRODUCTS RAIL ────────────────── */}
      <div className="pt-10 border-t border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-[11px] font-black rounded-full uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Customer Favorites
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              🔥 Trending & Bestsellers You Might Also Like
            </h2>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline"
          >
            Explore All Gifts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default OrderSuccessPage;
