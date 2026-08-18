import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import OrderTimeline from '../components/OrderTimeline';
import { ShoppingBag, FileText, RotateCcw, Upload, X, Clock, CheckCircle2, AlertTriangle, Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Countdown: shows days remaining for return window ─────────────────────────
const ReturnCountdown = ({ deliveredAt, returnPolicyDays = 6 }) => {
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    if (!deliveredAt) return;
    const calcDays = () => {
      const delivered = new Date(deliveredAt);
      const deadline = new Date(delivered.getTime() + returnPolicyDays * 86400000);
      const diff = Math.ceil((deadline - new Date()) / 86400000);
      setDaysLeft(Math.max(0, diff));
    };
    calcDays();
    const t = setInterval(calcDays, 60000);
    return () => clearInterval(t);
  }, [deliveredAt, returnPolicyDays]);

  if (daysLeft === null) return null;
  const color = daysLeft <= 1 ? 'text-red-600 bg-red-50 border-red-200' : daysLeft <= 3 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';
  const icon = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '✅';

  return (
    <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border ${color}`}>
      <Clock className="w-3.5 h-3.5" />
      {icon} Return window: <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> remaining
    </div>
  );
};

const OrdersPage = () => {
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnDetails, setReturnDetails] = useState('');
  const [returnPhotos, setReturnPhotos] = useState([]); // base64 previews
  const [returnPhotoURLs, setReturnPhotoURLs] = useState([]); // will store base64 as-is (no upload server needed)
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const res = await API.get('/orders/my-orders');
      return res.data.orders;
    }
  });

  const orders = data || [];

  // ── Photo selection ──────────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const readers = files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(base64s => {
      setReturnPhotos(base64s.map((b64, i) => ({ preview: b64, name: files[i].name })));
      setReturnPhotoURLs(base64s);
    });
  };

  // ── Submit Return Request ────────────────────────────────────────────────
  const handleReturnSubmit = async (orderId) => {
    if (!returnReason.trim()) {
      toast.error('Please specify a reason for return');
      return;
    }
    if (returnPhotos.length === 0) {
      toast.error('Please upload at least 1 photo as proof');
      return;
    }
    setSubmitting(true);
    try {
      const res = await API.post(`/orders/${orderId}/return-request`, {
        reason: returnReason,
        details: returnDetails,
        proofImages: returnPhotoURLs
      });
      if (res.data.success) {
        toast.success('Return request submitted! Admin will review within 24 hours.');
        setSelectedOrderForReturn(null);
        setReturnReason('');
        setReturnDetails('');
        setReturnPhotos([]);
        setReturnPhotoURLs([]);
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getReturnStatusBadge = (req) => {
    if (!req || !req.isRequested) return null;
    const map = {
      Pending:   { cls: 'bg-amber-100 text-amber-800 border-amber-300',   label: '⏳ Return Pending Review' },
      Approved:  { cls: 'bg-blue-100 text-blue-800 border-blue-300',      label: '✅ Return Approved — Pickup Scheduled' },
      Rejected:  { cls: 'bg-red-100 text-red-800 border-red-300',         label: '❌ Return Rejected' },
      Completed: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: '💚 Refund Initiated' }
    };
    const s = map[req.status] || map.Pending;
    return (
      <div className="space-y-1">
        <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-xl border ${s.cls}`}>{s.label}</span>
        {req.status === 'Approved' && req.estimatedPickupDays && (
          <p className="text-xs text-slate-500 ml-1">Pickup within <strong>{req.estimatedPickupDays} working days</strong>. Check email for Return OTP.</p>
        )}
        {req.status === 'Completed' && req.refundTransactionId && (
          <p className="text-xs text-emerald-700 ml-1">Txn: <strong>{req.refundTransactionId}</strong> · ₹{req.refundAmount}</p>
        )}
      </div>
    );
  };

  const canReturn = (order) => {
    if (order.orderStatus !== 'Delivered') return false;
    if (order.returnRequest?.isRequested) return false;
    const delivered = new Date(order.deliveredAt || order.updatedAt);
    const daysElapsed = (new Date() - delivered) / 86400000;
    return daysElapsed <= 6;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <SEOHead title="My Orders & Tracking" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Orders &amp; Live Tracking</h1>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <ShoppingBag className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">No orders placed yet</h3>
          <p className="text-xs text-slate-500">Discover our fresh flower bouquets, cakes, and 3D gifts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">

              {/* ── Delivery OTP Banner (customer sees when order is Shipped) ── */}
              {order.deliveryOTP && order.orderStatus !== 'Delivered' && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-white">
                    <span className="text-2xl">🔑</span>
                    <div>
                      <p className="font-bold text-sm">Your Delivery Verification OTP</p>
                      <p className="text-xs text-orange-100">Share this with the delivery agent to confirm delivery</p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl px-5 py-2 text-center">
                    <span className="text-white font-black text-2xl tracking-widest">{order.deliveryOTP}</span>
                  </div>
                </div>
              )}

              {/* ── Delivery Confirmed Banner ── */}
              {order.isDeliveryOTPVerified && order.orderStatus === 'Delivered' && (
                <div className="bg-emerald-500 px-6 py-2 flex items-center gap-2 text-white text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Delivery verified via OTP on {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-IN') : 'N/A'}
                </div>
              )}

              {/* ── Return Completed Banner ── */}
              {order.returnRequest?.status === 'Completed' && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 flex items-center gap-3 text-white">
                  <span className="text-2xl">💚</span>
                  <div>
                    <p className="font-bold text-sm">Refund Initiated!</p>
                    <p className="text-xs text-emerald-100">₹{order.returnRequest.refundAmount} · Txn: {order.returnRequest.refundTransactionId}</p>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase block">Order #{order.orderNumber}</span>
                    <span className="text-xs text-slate-500">Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    {order.deliveredAt && (
                      <span className="text-xs text-emerald-600 block">Delivered {new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      order.paymentStatus === 'Refunded' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {order.paymentStatus} · {order.paymentMethod}
                    </span>

                    {/* Invoice Link */}
                    <a
                      href={`${(import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')}/orders/${order._id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition border border-slate-200"
                    >
                      <FileText className="w-4 h-4 text-indigo-500" /> Tax Invoice
                    </a>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                        {item.variantName && <p className="text-[11px] text-slate-400">{item.variantName}</p>}
                        <p className="text-[11px] text-slate-500">Qty: {item.qty} × ₹{item.price}</p>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 flex-shrink-0">₹{item.qty * item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Gift Message */}
                {order.giftOptions?.giftMessage && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900">
                    <span className="font-bold">💌 Gift Message:</span> "{order.giftOptions.giftMessage}"
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <OrderTimeline currentStatus={order.orderStatus} />
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 gap-4">
                  <div className="text-xs text-slate-600">
                    Total Paid: <strong className="text-sm font-extrabold text-amber-700">₹{order.pricing.totalAmount}</strong>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {/* Return countdown timer */}
                    {order.orderStatus === 'Delivered' && !order.returnRequest?.isRequested && (
                      <ReturnCountdown deliveredAt={order.deliveredAt || order.updatedAt} />
                    )}

                    {/* Return status or request button */}
                    {order.returnRequest?.isRequested ? (
                      getReturnStatusBadge(order.returnRequest)
                    ) : canReturn(order) ? (
                      <button
                        onClick={() => {
                          setSelectedOrderForReturn(order._id);
                          setReturnReason('');
                          setReturnDetails('');
                          setReturnPhotos([]);
                          setReturnPhotoURLs([]);
                        }}
                        className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition"
                      >
                        <RotateCcw className="w-4 h-4" /> Request Return
                      </button>
                    ) : order.orderStatus === 'Delivered' ? (
                      <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        Return window expired
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* ── Return Form ── */}
                {selectedOrderForReturn === order._id && (
                  <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                        <Package className="w-4 h-4" /> Return Request Form
                      </h4>
                      <button onClick={() => setSelectedOrderForReturn(null)} className="text-slate-400 hover:text-slate-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-rose-800 block mb-1">Reason for Return *</label>
                        <select
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                          className="w-full p-2.5 text-xs border border-rose-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-400"
                        >
                          <option value="">Select a reason...</option>
                          <option value="Damaged / Defective product">Damaged / Defective product</option>
                          <option value="Wrong item delivered">Wrong item delivered</option>
                          <option value="Product not as described">Product not as described</option>
                          <option value="Changed my mind">Changed my mind</option>
                          <option value="Quality not satisfactory">Quality not satisfactory</option>
                          <option value="Other">Other reason</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-rose-800 block mb-1">Additional Details</label>
                        <textarea
                          rows={2}
                          value={returnDetails}
                          onChange={(e) => setReturnDetails(e.target.value)}
                          placeholder="Describe the issue in detail..."
                          className="w-full p-2.5 text-xs border border-rose-300 rounded-xl bg-white outline-none resize-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-rose-800 block mb-1">
                          Upload Photo Proof * <span className="text-rose-500">(min 1, max 5)</span>
                        </label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-rose-300 rounded-xl p-4 text-center cursor-pointer hover:bg-rose-100/50 transition"
                        >
                          <Upload className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                          <p className="text-xs text-rose-600 font-medium">Click to upload photos</p>
                          <p className="text-[10px] text-rose-400">JPG, PNG, WEBP (max 5 photos)</p>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                        {returnPhotos.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-2">
                            {returnPhotos.map((p, i) => (
                              <div key={i} className="relative">
                                <img src={p.preview} alt={p.name} className="w-16 h-16 rounded-lg object-cover border-2 border-rose-300" />
                                <button
                                  onClick={() => {
                                    setReturnPhotos(prev => prev.filter((_, j) => j !== i));
                                    setReturnPhotoURLs(prev => prev.filter((_, j) => j !== i));
                                  }}
                                  className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold"
                                >×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-rose-100 rounded-xl p-3 text-xs text-rose-800">
                      <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                      <strong>Return Policy:</strong> Returns are accepted within 6 days of delivery. Admin verification is required. If approved, a pickup agent will arrive within 2 working days with a Return OTP.
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReturnSubmit(order._id)}
                        disabled={submitting}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition"
                      >
                        {submitting ? 'Submitting...' : 'Submit Return Request'}
                      </button>
                      <button
                        onClick={() => setSelectedOrderForReturn(null)}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
