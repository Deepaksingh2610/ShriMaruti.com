import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import { useGoogleLogin } from '@react-oauth/google';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import OtpVerificationModal from '../components/OtpVerificationModal';
import { Share2, Copy, Eye, EyeOff, UserCheck, MapPin, Plus, Trash2, Edit3, Lock, CheckCircle2, Navigation, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { nameSchema, emailSchema, phoneSchema, passwordSchema, streetSchema, pincodeSchema } from '../utils/validation';
import { detectCurrentLocation } from '../services/locationService';

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  referralCodeUsed: z.string().optional()
});

const profileEditSchema = z.object({
  name: nameSchema,
  phone: phoneSchema
});

const addressSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  street: streetSchema,
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: pincodeSchema
});

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  const [isSignup, setIsSignup] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpType, setOtpType] = useState('signup');
  const [resendAllowedAt, setResendAllowedAt] = useState(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm({ resolver: zodResolver(signupSchema) });
  
  const profileForm = useForm({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  });

  const addressForm = useForm({ resolver: zodResolver(addressSchema) });

  // Update default profile form values when user changes
  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, phone: user.phone });
    }
  }, [user, profileForm]);

  // Automatic redirect to Admin Panel if logged-in user is admin/support
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'support')) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const onLoginSubmit = async (data) => {
    setAuthSubmitting(true);
    try {
      const res = await API.post('/auth/login', data);
      if (res.data.requireOtp) {
        setOtpEmail(data.email);
        setOtpType('login');
        setResendAllowedAt(res.data.resendAllowedAt);
        setShowOtpModal(true);
        toast.success(res.data.message || 'OTP sent to your email!');
      } else if (res.data.success) {
        setAuth(res.data.user, res.data.token);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        if (res.data.user.role === 'admin' || res.data.user.role === 'support') {
          navigate('/admin', { replace: true });
        }
      }
    } catch (err) {
      const isNotFound = err.response?.data?.notFound || err.response?.status === 404;
      const msg = err.response?.data?.message || 'Login failed';
      if (isNotFound) {
        toast.error(msg || "We couldn't find your account. Please create an account.", { duration: 4500 });
        setIsSignup(true);
        signupForm.setValue('email', data.email);
        if (data.password) {
          signupForm.setValue('password', data.password);
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const onSignupSubmit = async (data) => {
    setAuthSubmitting(true);
    try {
      const res = await API.post('/auth/register', data);
      if (res.data.requireOtp) {
        setOtpEmail(data.email);
        setOtpType('signup');
        setResendAllowedAt(res.data.resendAllowedAt);
        setShowOtpModal(true);
        toast.success(res.data.message || 'OTP sent to your email!');
      } else if (res.data.success) {
        // Direct login (e.g. for admin/support credentials entered on signup form)
        setAuth(res.data.user, res.data.token);
        if (res.data.user.role === 'admin' || res.data.user.role === 'support') {
          toast.success(`Welcome Admin, ${res.data.user.name}!`);
          navigate('/admin', { replace: true });
        } else {
          toast.success(`Welcome, ${res.data.user.name}!`);
        }
      }
    } catch (err) {
      const isExistingUser = err.response?.data?.isExistingUser;
      const msg = err.response?.data?.message || 'Signup failed';
      if (isExistingUser) {
        toast.error(msg, { duration: 4500 });
        setIsSignup(false);
        loginForm.setValue('email', data.email);
        if (data.password) {
          loginForm.setValue('password', data.password);
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleOtpSuccess = (resData) => {
    setShowOtpModal(false);
    setAuth(resData.user, resData.token);
    toast.success(`Welcome back, ${resData.user.name}!`);
    if (resData.user.role === 'admin' || resData.user.role === 'support') {
      navigate('/admin', { replace: true });
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setAuthSubmitting(true);
    try {
      // Exchange access_token for user info then send to our backend
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      const userInfo = await userInfoRes.json();

      if (!userInfo.email) {
        toast.error('Google sign-in failed. Could not get your email.');
        return;
      }

      // Send verified info to our backend
      const res = await API.post('/auth/google-popup', {
        sub: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        email_verified: userInfo.email_verified
      });

      if (res.data.success) {
        setAuth(res.data.user, res.data.token);
        toast.success(`Welcome, ${res.data.user.name}! 😊`);
        if (res.data.user.role === 'admin' || res.data.user.role === 'support') {
          navigate('/admin', { replace: true });
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to sign in with Google. Please try again.';
      toast.error(msg);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed.');
    setAuthSubmitting(false);
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'implicit'
  });

  const onUpdateProfileSubmit = async (data) => {
    try {
      const res = await API.put('/auth/profile', {
        name: data.name,
        phone: data.phone
      });
      if (res.data.success) {
        setAuth(res.data.user, useAuthStore.getState().token);
        toast.success('Profile details updated successfully!');
        setIsEditingProfile(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile update failed');
    }
  };

  const [detectingGps, setDetectingGps] = useState(false);

  const handleGpsAutoFill = async () => {
    setDetectingGps(true);
    try {
      const loc = await detectCurrentLocation({ enableHighAccuracy: true });
      if (loc) {
        if (loc.houseNumber || loc.road || loc.locality) {
          addressForm.setValue('street', [loc.houseNumber, loc.road, loc.locality].filter(Boolean).join(', '));
        }
        if (loc.neighbourhood || loc.locality) {
          addressForm.setValue('landmark', loc.neighbourhood || loc.locality);
        }
        if (loc.city) {
          addressForm.setValue('city', loc.city);
        }
        if (loc.state) {
          addressForm.setValue('state', loc.state);
        }
        if (loc.pincode) {
          addressForm.setValue('pincode', loc.pincode);
        }
        toast.success(`Location detected: ${loc.locality || loc.city} (~${Math.round(loc.accuracy)}m)`);
      }
    } catch (err) {
      toast.error(err.message || 'Could not auto-detect GPS location');
    } finally {
      setDetectingGps(false);
    }
  };

  const onAddAddressSubmit = async (data) => {
    try {
      const res = await API.post('/auth/addresses', data);
      if (res.data.success) {
        // Refresh me data to update user store
        const meRes = await API.get('/auth/me');
        if (meRes.data.success) {
          setAuth(meRes.data.user, useAuthStore.getState().token);
        }
        toast.success('New delivery address added successfully!');
        setShowAddAddressModal(false);
        addressForm.reset();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to remove this saved address?')) return;
    try {
      const res = await API.delete(`/auth/addresses/${addressId}`);
      if (res.data.success) {
        const meRes = await API.get('/auth/me');
        if (meRes.data.success) {
          setAuth(meRes.data.user, useAuthStore.getState().token);
        }
        toast.success('Saved address removed');
      }
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleCopyReferral = () => {
    if (user && user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast.success('Referral code copied!');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <SEOHead title={isSignup ? 'Create Account' : 'Sign In'} />
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900">{isSignup ? 'Join Shri Maruti' : 'Welcome Back'}</h2>
            <p className="text-xs text-slate-500">{isSignup ? 'Get 50 instant bonus loyalty points!' : 'Sign in to manage orders & reminders'}</p>
          </div>

          {isSignup ? (
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input type="text" {...signupForm.register('name')} className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none" />
                {signupForm.formState.errors.name && <span className="text-[11px] text-rose-600">{signupForm.formState.errors.name.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                <input type="email" {...signupForm.register('email')} className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none" />
                {signupForm.formState.errors.email && <span className="text-[11px] text-rose-600">{signupForm.formState.errors.email.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs font-extrabold text-slate-600">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    {...signupForm.register('phone')}
                    className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-r-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                {signupForm.formState.errors.phone && <span className="text-[11px] text-rose-600 block mt-1">{signupForm.formState.errors.phone.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    {...signupForm.register('password')}
                    className="w-full px-4 py-2.5 pr-10 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    title={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupForm.formState.errors.password && <span className="text-[11px] text-rose-600">{signupForm.formState.errors.password.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Referral Code (Optional)</label>
                <input type="text" {...signupForm.register('referralCodeUsed')} placeholder="e.g. GG12345" className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none uppercase font-bold" />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {authSubmitting ? 'Sending OTP Code...' : 'Create Account & Claim Reward'}
              </button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                <input type="email" {...loginForm.register('email')} className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none" />
                {loginForm.formState.errors.email && <span className="text-[11px] text-rose-600">{loginForm.formState.errors.email.message}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    {...loginForm.register('password')}
                    className="w-full px-4 py-2.5 pr-10 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && <span className="text-[11px] text-rose-600">{loginForm.formState.errors.password.message}</span>}
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {authSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ────── OR DIVIDER & GOOGLE SIGN-IN ────── */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] text-slate-400 font-black tracking-widest uppercase absolute">
                OR
              </span>
            </div>

            <button
              onClick={() => loginWithGoogle()}
              disabled={authSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-5 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {authSubmitting ? 'Signing in...' : 'Continue with Google'}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              {isSignup ? 'Already have an account? Sign In' : 'New to Shri Maruti? Create Account'}
            </button>
          </div>
        </div>

        {/* ── OTP VERIFICATION MODAL FOR UNAUTHENTICATED USER ──────────────── */}
        {showOtpModal && (
          <OtpVerificationModal
            email={otpEmail}
            type={otpType}
            initialResendAllowedAt={resendAllowedAt}
            onSuccess={handleOtpSuccess}
            onCancel={() => setShowOtpModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SEOHead title="My Profile & Addresses" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Account & Saved Details</h1>
          <p className="text-xs text-slate-500">Manage your profile info, phone number & saved delivery addresses</p>
        </div>
        <button
          onClick={() => useAuthStore.getState().logout()}
          className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 text-2xl font-black flex items-center justify-center mx-auto">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
            <p className="text-xs text-slate-600 font-bold mt-0.5">{user.phone?.startsWith('+91') ? user.phone : `+91 ${user.phone}`}</p>
            <span className="inline-block bg-amber-100 text-amber-900 font-extrabold text-xs px-3 py-1 rounded-full mt-3">
              ⭐ {user.loyaltyPoints || 0} Loyalty Coins
            </span>
          </div>
        </div>

        {/* Referral Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-amber-200 text-xs font-extrabold uppercase">
              <Share2 className="w-4 h-4" /> Refer & Earn Rewards
            </div>
            <h3 className="text-xl font-black mt-1">Share Code, Earn 50 Points!</h3>
            <p className="text-xs text-amber-100 mt-1">
              Give your friends ₹50 off on their first order and earn 50 loyalty points automatically.
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-100 block uppercase font-bold">Your Unique Code</span>
              <span className="text-lg font-black tracking-widest">{user.referralCode || 'GG100'}</span>
            </div>
            <button
              onClick={handleCopyReferral}
              className="p-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
        </div>

      </div>

      {/* ── EDIT PERSONAL DETAILS SECTION ───────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-600" /> Personal Details
          </h3>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-xs rounded-xl flex items-center gap-1 border border-amber-200 transition"
          >
            <Edit3 className="w-3.5 h-3.5" /> {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={profileForm.handleSubmit(onUpdateProfileSubmit)} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  {...profileForm.register('name')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none font-semibold text-slate-900"
                />
                {profileForm.formState.errors.name && <span className="text-rose-600 block mt-1">{profileForm.formState.errors.name.message}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs font-extrabold text-slate-600">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    {...profileForm.register('phone')}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-r-xl outline-none font-semibold text-slate-900"
                  />
                </div>
                {profileForm.formState.errors.phone && <span className="text-rose-600 block mt-1">{profileForm.formState.errors.phone.message}</span>}
              </div>

              {/* READ ONLY EMAIL FIELD */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 flex items-center gap-1 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Read-only for account security)</span>
                  <Lock className="w-3 h-3 text-slate-400" />
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  readOnly
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-bold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition">
                Save Profile Changes
              </button>
              <button type="button" onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 border border-slate-300 font-bold rounded-xl text-slate-700">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Full Name</span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{user.name}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Registered Email</span>
              <p className="font-bold text-slate-900 mt-0.5">{user.email}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mobile Number</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{user.phone?.startsWith('+91') ? user.phone : `+91 ${user.phone}`}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── SAVED SHIPPING ADDRESSES SECTION ───────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" /> Saved Delivery Addresses
            </h3>
            <p className="text-xs text-slate-500">Saved addresses for faster 1-click checkout</p>
          </div>
          <button
            onClick={() => setShowAddAddressModal(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>

        {/* Address List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {user.addresses && user.addresses.length > 0 ? (
            user.addresses.map((addr) => (
              <div key={addr._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{addr.fullName || user.name}</span>
                  {addr.isDefault && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Default</span>
                  )}
                </div>
                <p className="text-slate-600 font-semibold">📞 {addr.phone || user.phone}</p>
                <p className="text-slate-600 leading-relaxed">
                  {addr.street}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                </p>
                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-rose-600 hover:text-rose-800 font-bold text-[11px] flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Address
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 col-span-2 text-center py-6">No saved addresses yet. Click "Add Address" to save your shipping destination.</p>
          )}
        </div>
      </div>

      {/* ── ADD ADDRESS MODAL ────────────────────────────────────────────── */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Add Delivery Address</h3>
              <button onClick={() => setShowAddAddressModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            <button
              type="button"
              onClick={handleGpsAutoFill}
              disabled={detectingGps}
              className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {detectingGps ? (
                <>
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Detecting GPS Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-amber-600 fill-amber-600" />
                  <span>Auto-Fill Current GPS Location</span>
                </>
              )}
            </button>

            <form onSubmit={addressForm.handleSubmit(onAddAddressSubmit)} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recipient Name *</label>
                  <input type="text" {...addressForm.register('fullName')} defaultValue={user.name} className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input type="tel" maxLength={10} {...addressForm.register('phone')} defaultValue={user.phone} className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Street Address / House No. *</label>
                  <input type="text" {...addressForm.register('street')} placeholder="e.g. Flat 302, Green Park Apartments" className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Landmark (Optional)</label>
                  <input type="text" {...addressForm.register('landmark')} placeholder="e.g. Near City Hospital" className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pincode *</label>
                  <input type="text" maxLength={6} {...addressForm.register('pincode')} placeholder="226001" className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City *</label>
                  <input type="text" {...addressForm.register('city')} defaultValue="Lucknow" className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State *</label>
                  <input type="text" {...addressForm.register('state')} defaultValue="Uttar Pradesh" className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="submit" className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md">Save Address</button>
                <button type="button" onClick={() => setShowAddAddressModal(false)} className="py-3 px-5 border border-slate-300 font-bold rounded-xl text-slate-700">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/orders"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-amber-500 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">My Orders & Tracking</h4>
            <p className="text-xs text-slate-500">View live status, order history & invoices</p>
          </div>
          <span className="p-3 bg-amber-100 text-amber-800 rounded-2xl font-bold text-xs">View Orders →</span>
        </Link>

        <Link
          to="/wishlist"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-amber-500 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">My Saved Wishlist</h4>
            <p className="text-xs text-slate-500">View your favorite gifts & hampers</p>
          </div>
          <span className="p-3 bg-amber-100 text-amber-800 rounded-2xl font-bold text-xs">View Saved →</span>
        </Link>
      </div>

      {/* ── OTP VERIFICATION MODAL ───────────────────────────────────────── */}
      {showOtpModal && (
        <OtpVerificationModal
          email={otpEmail}
          type={otpType}
          initialResendAllowedAt={resendAllowedAt}
          onSuccess={handleOtpSuccess}
          onCancel={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
