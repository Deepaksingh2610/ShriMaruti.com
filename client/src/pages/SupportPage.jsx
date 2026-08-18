import React, { useState } from 'react';
import SEOHead from '../components/SEOHead';
import { PhoneCall, MessageSquare, Headphones, Mail, HelpCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SupportPage = () => {
  const [callName, setCallName] = useState('');
  const [callPhone, setCallPhone] = useState('');

  const handleCallRequest = (e) => {
    e.preventDefault();
    if (!callPhone) {
      toast.error('Please enter phone number');
      return;
    }
    toast.success('Call back request received! Our support agent will call you in 15 mins.');
    setCallName('');
    setCallPhone('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <SEOHead title="Customer Support & Call Request" />

      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full uppercase tracking-wider">
          <Headphones className="w-3.5 h-3.5 text-amber-600" /> 24x7 Customer Help
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">How Can We Help You?</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Our dedicated gifting support team is here to assist with order tracking, custom orders, or delivery queries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Phone Toll-Free Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <PhoneCall className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">Toll-Free Helpline</h4>
          <p className="text-base font-extrabold text-amber-700">1800-419-7700</p>
          <p className="text-[11px] text-slate-400">Available 8 AM - 10 PM IST</p>
        </div>

        {/* WhatsApp Click to Chat */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <MessageSquare className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">WhatsApp Instant Chat</h4>
          <a
            href="https://wa.me/919876543210?text=Hi%20Shri%20Maruti%20Support!%20I%20need%20help%20with%20my%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Chat On WhatsApp
          </a>
        </div>

        {/* Email Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <Mail className="w-8 h-8 text-indigo-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">Email Support</h4>
          <p className="text-xs font-bold text-slate-800">support@shrimaruti.com</p>
          <p className="text-[11px] text-slate-400">Response within 2 hours</p>
        </div>

      </div>

      {/* Call Back Request Form */}
      <form onSubmit={handleCallRequest} className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Request An Immediate Call Back</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Your Name</label>
            <input
              type="text"
              value={callName}
              onChange={(e) => setCallName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
            <input
              type="text"
              value={callPhone}
              onChange={(e) => setCallPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none font-bold"
            />
          </div>
        </div>
        <button type="submit" className="px-6 py-3 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md">
          Submit Call Back Request
        </button>
      </form>

    </div>
  );
};

export default SupportPage;
