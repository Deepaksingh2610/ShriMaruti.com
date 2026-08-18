import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, Mail, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const OtpVerificationModal = ({
  email,
  type = 'signup',
  onSuccess,
  onCancel,
  initialResendAllowedAt
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const inputRefs = useRef([]);

  // Auto-focus first input on modal mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Calculate timer based on resendAllowedAt or fallback to 60s
  useEffect(() => {
    let initialSec = 60;
    if (initialResendAllowedAt) {
      const diff = Math.ceil((new Date(initialResendAllowedAt) - new Date()) / 1000);
      initialSec = diff > 0 ? diff : 0;
    }
    setSecondsLeft(initialSec);
  }, [initialResendAllowedAt]);

  // Countdown interval timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleChange = (index, value) => {
    // Only accept numeric digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next box if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move focus to previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 0) return;

    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);

    // Focus last filled box or next empty box
    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const fullOtp = otp.join('');
  const isOtpComplete = fullOtp.length === 6;

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!isOtpComplete || loading) return;

    setLoading(true);
    try {
      const res = await API.post('/auth/verify-otp', {
        email,
        otp: fullOtp,
        type
      });

      if (res.data.success) {
        toast.success(res.data.message || 'OTP Verified Successfully!');
        if (onSuccess) {
          onSuccess(res.data);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed. Please try again.';
      toast.error(msg);
      // Clear OTP inputs on invalid attempt
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;

    setResending(true);
    try {
      const res = await API.post('/auth/resend-otp', { email, type });
      if (res.data.success) {
        toast.success(res.data.message || 'New OTP sent to your email!');
        setSecondsLeft(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-slate-100 relative">
        
        {/* Top Icon Badge & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify Your Email</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            We've sent a 6-digit OTP code to <br />
            <strong className="text-slate-800 font-bold break-all flex items-center justify-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-amber-600 inline" /> {email}
            </strong>
          </p>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between items-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold rounded-2xl border-2 outline-none transition shadow-sm ${
                  digit
                    ? 'border-amber-500 bg-amber-50/40 text-amber-900 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={!isOtpComplete || loading}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition ${
                isOtpComplete && !loading
                  ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-amber-600/30 hover:scale-[1.01]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying OTP...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5" /> Verify OTP
                </>
              )}
            </button>

            {/* Resend & Change Email Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Email
              </button>

              {secondsLeft > 0 ? (
                <span className="text-slate-400 font-semibold bg-slate-100 px-3 py-1 rounded-full text-[11px]">
                  Resend OTP in <strong className="text-slate-700 font-bold">{secondsLeft}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-amber-600 hover:text-amber-700 font-extrabold flex items-center gap-1 hover:underline transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} /> Resend OTP
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Security Tagline */}
        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
          <Lock className="w-3 h-3 text-slate-400" /> Protected by ShrimAruti 256-bit OTP Security
        </div>

      </div>
    </div>
  );
};

export default OtpVerificationModal;
