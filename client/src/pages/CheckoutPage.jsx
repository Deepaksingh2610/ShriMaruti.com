import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import {
  ShieldCheck, Truck, CreditCard, Banknote, MapPin, User, CheckCircle2, ArrowRight,
  QrCode, Copy, Upload, Check, RefreshCcw, Clock, AlertCircle, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { nameSchema, emailSchema, phoneSchema, pincodeSchema, streetSchema } from '../utils/validation';

import { useLocationStore } from '../store/useLocationStore';
import LocationConfirmation from '../components/location/LocationConfirmation';

const checkoutSchema = z.object({
  senderName: nameSchema,
  senderPhone: phoneSchema,
  senderEmail: emailSchema,
  
  isShipToDifferent: z.boolean().default(false),
  
  recipientName: nameSchema,
  recipientPhone: phoneSchema,
  street: streetSchema,
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: pincodeSchema
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const locationStore = useLocationStore();
  const {
    cartItems, getItemsTotal, clearCart,
    isGiftWrapped, giftMessage,
    appliedCoupon, appliedGiftCard, usedLoyaltyPoints
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'COD'
  const [upiScreenshotFile, setUpiScreenshotFile] = useState(null);
  const [upiScreenshotPreview, setUpiScreenshotPreview] = useState('');
  const [upiUtr, setUpiUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch dynamic active UPI configuration from DB
  const { data: upiData } = useQuery({
    queryKey: ['upiSettings'],
    queryFn: async () => {
      const res = await API.get('/payment/upi-settings');
      return res.data;
    }
  });

  const upiSettings = upiData?.settings || {
    upiId: 'shreemaruti@upi',
    qrCode: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop' }
  };

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      senderName: user ? user.name : '',
      senderPhone: user ? user.phone || '' : '',
      senderEmail: user ? user.email : '',
      recipientName: user ? user.name : '',
      recipientPhone: user ? user.phone || '' : '',
      street: locationStore.deliveryAddress || (user && user.addresses?.length > 0 ? user.addresses[0].street : ''),
      city: locationStore.deliveryCity || (user && user.addresses?.length > 0 ? user.addresses[0].city : 'Lucknow'),
      state: locationStore.deliveryState || (user && user.addresses?.length > 0 ? user.addresses[0].state : 'Uttar Pradesh'),
      pincode: locationStore.deliveryPincode || (user && user.addresses?.length > 0 ? user.addresses[0].pincode : '226028')
    }
  });

  // Sync form when user selects/changes location in locationStore
  React.useEffect(() => {
    if (locationStore.deliveryPincode) {
      setValue('pincode', locationStore.deliveryPincode);
    }
    if (locationStore.deliveryCity) {
      setValue('city', locationStore.deliveryCity);
    }
    if (locationStore.deliveryState) {
      setValue('state', locationStore.deliveryState);
    }
    if (locationStore.deliveryAddress) {
      setValue('street', locationStore.deliveryAddress);
    }
  }, [locationStore.deliveryPincode, locationStore.deliveryCity, locationStore.deliveryState, locationStore.deliveryAddress, setValue]);

  const itemsTotal = getItemsTotal();
  const giftWrapFee = isGiftWrapped ? 49 : 0;
  const deliveryFee = itemsTotal >= 499 ? 0 : 70;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const giftCardDiscount = appliedGiftCard ? Math.min(appliedGiftCard.balance, itemsTotal + giftWrapFee + deliveryFee - couponDiscount) : 0;
  const loyaltyDiscount = usedLoyaltyPoints;
  const finalTotal = Math.max(0, itemsTotal + giftWrapFee + deliveryFee - couponDiscount - giftCardDiscount - loyaltyDiscount);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const validateUTRInput = (utr) => {
    if (!utr || !utr.trim()) return { isValid: false, message: 'UTR / Transaction ID is required.' };
    const cleanUtr = utr.trim().toUpperCase();

    if (cleanUtr.length < 12 || cleanUtr.length > 18) {
      return {
        isValid: false,
        message: `Transaction ID must be 12 to 18 characters long. (${cleanUtr.length}/12 chars)`
      };
    }

    if (!/^[A-Z0-9]+$/.test(cleanUtr)) {
      return {
        isValid: false,
        message: 'Transaction ID must contain only letters and numbers (no spaces or symbols).'
      };
    }

    if (/^([A-Z0-9])\1+$/.test(cleanUtr)) {
      return {
        isValid: false,
        message: 'Invalid Transaction ID: Cannot be all repetitive characters (e.g. 000000000000).'
      };
    }

    const dummySequences = ['123456789012', '012345678901', '987654321098', '1234567890123', '000000000000'];
    if (dummySequences.includes(cleanUtr)) {
      return {
        isValid: false,
        message: 'Invalid Transaction ID: Enter real 12-digit UTR from your PhonePe/GPay/Paytm app.'
      };
    }

    return { isValid: true, message: '✓ Valid 12-digit UPI UTR / Reference ID' };
  };

  const onCheckoutSubmit = async (data) => {
    // Validate UPI payment proof fields when UPI is selected
    if (paymentMethod === 'UPI') {
      if (!upiScreenshotFile) {
        toast.error('Please upload your payment screenshot.');
        return;
      }
      const utrCheck = validateUTRInput(upiUtr);
      if (!utrCheck.isValid) {
        toast.error(utrCheck.message);
        return;
      }
    }

    setLoading(true);
    try {
      const orderPayload = {
        orderItems: cartItems,
        senderDetails: {
          name: data.senderName,
          phone: data.senderPhone,
          email: data.senderEmail
        },
        shippingAddress: {
          fullName: data.recipientName,
          phone: data.recipientPhone,
          street: data.street,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: 'India',
          location: locationStore.latitude && locationStore.longitude ? {
            type: 'Point',
            coordinates: [Number(locationStore.longitude), Number(locationStore.latitude)]
          } : undefined,
          accuracy: locationStore.accuracy,
          accuracyLevel: locationStore.accuracyLevel,
          source: locationStore.source || 'checkout-confirmed',
          userConfirmed: true
        },
        giftOptions: {
          isGiftWrapped,
          giftWrapFee,
          giftMessage,
          isShipToDifferent: data.isShipToDifferent
        },
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        giftCardCode: appliedGiftCard ? appliedGiftCard.code : null,
        loyaltyPointsToUse: usedLoyaltyPoints
      };

      // 1. Create Order in backend
      const res = await API.post('/orders', orderPayload);

      if (res.data.success) {
        const order = res.data.order;

        if (paymentMethod === 'UPI') {
          // 2. Submit UPI Payment Proof to backend
          const formData = new FormData();
          formData.append('orderId', order._id);
          formData.append('utrNumber', upiUtr.trim());
          formData.append('screenshot', upiScreenshotFile);

          await API.post('/payment/upi/submit', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          clearCart();
          toast.success(
            'Your payment proof has been submitted. Your order will be confirmed after admin verification.',
            { duration: 6000 }
          );
          navigate(`/order-success/${order._id}`);
        } else {
          // COD Order
          clearCart();
          toast.success('Order placed successfully via Cash on Delivery!');
          navigate(`/order-success/${order._id}`);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead title="Checkout & Payment Verification" />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">Checkout & Payment</h1>

      <form onSubmit={handleSubmit(onCheckoutSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sender Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-amber-600" /> Sender / Buyer Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  {...register('senderName')}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                {errors.senderName && <span className="text-[11px] text-rose-600 mt-1 block">{errors.senderName.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (For Order Updates) *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs font-extrabold text-slate-600">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    {...register('senderPhone')}
                    className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-r-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                {errors.senderPhone && <span className="text-[11px] text-rose-600 mt-1 block">{errors.senderPhone.message}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address (For Tax Invoice & Verification Alerts) *</label>
                <input
                  type="email"
                  {...register('senderEmail')}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                {errors.senderEmail && <span className="text-[11px] text-rose-600 mt-1 block">{errors.senderEmail.message}</span>}
              </div>
            </div>
          </div>

          {/* Recipient Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-amber-600" /> Delivery Address
            </h3>

            {/* Confirmed Delivery Location Banner */}
            <LocationConfirmation
              location={{
                locality: locationStore.deliveryPlace,
                city: locationStore.deliveryCity,
                district: locationStore.deliveryDistrict,
                state: locationStore.deliveryState,
                pincode: locationStore.deliveryPincode,
                address: locationStore.deliveryAddress,
                accuracy: locationStore.accuracy,
                accuracyLevel: locationStore.accuracyLevel
              }}
              onChangeLocation={locationStore.openModal}
              showFullDetails={false}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Name *</label>
                <input
                  type="text"
                  {...register('recipientName')}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                {errors.recipientName && <span className="text-[11px] text-rose-600 mt-1 block">{errors.recipientName.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Phone *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs font-extrabold text-slate-600">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    {...register('recipientPhone')}
                    className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-r-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                {errors.recipientPhone && <span className="text-[11px] text-rose-600 mt-1 block">{errors.recipientPhone.message}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Flat / House No. / Street Address *</label>
                <input
                  type="text"
                  {...register('street')}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                {errors.street && <span className="text-[11px] text-rose-600 mt-1 block">{errors.street.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  {...register('landmark')}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none font-medium"
                />
                {errors.city && <span className="text-[11px] text-rose-600 mt-1 block">{errors.city.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">State *</label>
                <input
                  type="text"
                  {...register('state')}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none font-medium"
                />
                {errors.state && <span className="text-[11px] text-rose-600 mt-1 block">{errors.state.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pincode *</label>
                <input
                  type="text"
                  maxLength={6}
                  {...register('pincode')}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none font-bold tracking-widest text-slate-900"
                />
                {errors.pincode && <span className="text-[11px] text-rose-600 mt-1 block">{errors.pincode.message}</span>}
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-amber-600" /> Select Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'UPI' ? 'border-amber-600 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input type="radio" name="pay" checked={paymentMethod === 'UPI'} readOnly className="accent-amber-600 w-4 h-4" />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block flex items-center gap-1.5">
                    📱 Direct UPI / Online Payment <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Fast</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Pay via GPay, PhonePe, Paytm QR & Upload Proof</span>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'COD' ? 'border-amber-600 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input type="radio" name="pay" checked={paymentMethod === 'COD'} readOnly className="accent-amber-600 w-4 h-4" />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Cash on Delivery (COD)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Pay in cash when package arrives</span>
                </div>
              </label>
            </div>

            {/* DYNAMIC MANUAL UPI PAYMENT SECTION (Only when UPI selected) */}
            {paymentMethod === 'UPI' && (
              <div className="mt-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 rounded-3xl p-6 space-y-6 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-amber-600" /> Shree Maruti Official UPI Payment
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Scan QR or copy UPI ID to pay exact amount: <strong className="text-amber-700 font-extrabold">₹{finalTotal}</strong></p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-pulse" /> Verification Pending State
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center p-5 bg-white border border-slate-200 rounded-2xl shadow-inner text-center">
                    <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-amber-500/20 p-2 bg-white shadow-sm mb-3">
                      <img
                        src={upiSettings.qrCode?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop'}
                        alt="Shree Maruti Official UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-black text-slate-900">Pay ₹{finalTotal}</span>
                    <span className="text-[10px] text-slate-400">Scan using Google Pay, PhonePe, Paytm, BHIM</span>
                  </div>

                  {/* UPI Details & Instructions */}
                  <div className="space-y-4">
                    <div className="bg-amber-100/60 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                      <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Official UPI ID</label>
                      <div className="flex items-center justify-between bg-white border border-amber-300/60 rounded-xl p-2.5 shadow-sm">
                        <span className="text-xs sm:text-sm font-black text-slate-900 font-mono select-all">
                          {upiSettings.upiId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(upiSettings.upiId)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-white/80 p-3.5 rounded-2xl border border-slate-200/70">
                      <p className="font-extrabold text-slate-800 mb-1">📌 Payment Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 text-[11px]">
                        <li>Complete the payment using the QR code or UPI ID.</li>
                        <li>Upload the payment screenshot.</li>
                        <li>Enter the UTR / Transaction ID.</li>
                        <li>Submit payment proof.</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* MANDATORY PAYMENT PROOF SUBMISSION FIELDS */}
                <div className="border-t border-amber-200/80 pt-5 space-y-4">
                  <h5 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" /> Mandatory Payment Proof Submission
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Payment Screenshot Upload */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        1. Payment Screenshot * <span className="text-[10px] font-normal text-slate-400">(Required)</span>
                      </label>
                      
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl cursor-pointer bg-white hover:bg-amber-50/40 transition text-center group">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              setUpiScreenshotFile(file);
                              setUpiScreenshotPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <Upload className="w-7 h-7 text-amber-600 group-hover:scale-110 transition mb-1" />
                        <span className="text-xs font-bold text-slate-700">Click or drag payment screenshot here</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP (Max 5MB)</span>
                      </label>

                      {upiScreenshotPreview && (
                        <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 h-32 group shadow-sm">
                          <img src={upiScreenshotPreview} alt="UPI Payment Screenshot Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <button
                              type="button"
                              onClick={() => { setUpiScreenshotFile(null); setUpiScreenshotPreview(''); }}
                              className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow hover:bg-red-700"
                            >
                              Remove / Change
                            </button>
                          </div>
                          <span className="absolute bottom-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                            <Check className="w-3 h-3" /> Screenshot Attached
                          </span>
                        </div>
                      )}
                    </div>

                    {/* UTR Number Input */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        2. UTR / Transaction ID * <span className="text-[10px] font-normal text-slate-400">(Required)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={18}
                        value={upiUtr}
                        onChange={e => setUpiUtr(e.target.value)}
                        placeholder="e.g. 423456789012"
                        className={`w-full px-4 py-3 text-xs border rounded-xl outline-none transition font-mono font-bold text-slate-900 bg-white ${
                          upiUtr.trim()
                            ? validateUTRInput(upiUtr).isValid
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                              : 'border-rose-400 ring-2 ring-rose-400/20'
                            : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                        }`}
                      />
                      {upiUtr.trim() ? (
                        <p className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${
                          validateUTRInput(upiUtr).isValid ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {validateUTRInput(upiUtr).message}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-1.5">
                          Found in GPay / PhonePe / Paytm / BHIM receipt (12 to 18-digit UTR/RRN reference number).
                        </p>
                      )}

                      <div className="mt-4 p-3 bg-amber-100/50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium space-y-1">
                        <p className="font-extrabold flex items-center gap-1 text-amber-950">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> Payment Status: Waiting for Admin Verification
                        </p>
                        <p className="text-[10px] text-amber-800">
                          Your order will be created instantly and placed in verification queue. Admin will verify UTR & screenshot to confirm order.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Invoice Overview & Submit */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">Order Final Invoice</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Items ({cartItems.length})</span>
                <span className="font-bold text-slate-900">₹{itemsTotal}</span>
              </div>

              {isGiftWrapped && (
                <div className="flex justify-between text-slate-600">
                  <span>Gift Wrap</span>
                  <span className="font-bold text-slate-900">+₹49</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600 uppercase">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Savings</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              {giftCardDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Gift Card Savings</span>
                  <span>-₹{giftCardDiscount}</span>
                </div>
              )}

              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Loyalty Savings</span>
                  <span>-₹{loyaltyDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Amount to Pay</span>
                <span className="text-amber-700">₹{finalTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" /> Submitting Payment Proof...
                </>
              ) : (
                <>
                  <span>{paymentMethod === 'UPI' ? `Submit Payment Proof (₹${finalTotal})` : `Place Order (₹${finalTotal})`}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default CheckoutPage;
