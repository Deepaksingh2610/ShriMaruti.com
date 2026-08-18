import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { ShieldCheck, Truck, RotateCcw, FileText, Lock, Users, Award, Building, Sparkles, CheckCircle, Mail, Phone, MapPin, ExternalLink, HelpCircle } from 'lucide-react';

const CompanyPolicyPages = () => {
  const location = useLocation();
  const { venture } = useParams();
  const path = location.pathname;

  // Determine active view based on path
  let activeView = 'about';
  if (path.includes('terms')) activeView = 'terms';
  else if (path.includes('privacy')) activeView = 'privacy';
  else if (path.includes('shipping')) activeView = 'shipping';
  else if (path.includes('return')) activeView = 'return';
  else if (path.includes('grievance')) activeView = 'grievance';
  else if (path.includes('epr')) activeView = 'epr';
  else if (path.includes('careers')) activeView = 'careers';
  else if (path.includes('press')) activeView = 'press';
  else if (path.includes('group') || venture) activeView = 'group';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── ABOUT US ──────────────────────────────────────────────────────── */}
      {activeView === 'about' && (
        <div className="space-y-8">
          <SEOHead title="About Us - ShriMaruti Gifting & Expressions" />
          
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
            <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Established 2007 · Lucknow</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Crafting Memories & Joy</h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mx-auto leading-relaxed font-medium">
              ShriMaruti.com is India's premier artisanal gifting & personalized expression destination. From handcrafted 3D acrylic light frames to velvet-wrapped gourmet hampers, we deliver heartfelt emotions across 2,500+ Indian cities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
              <Sparkles className="w-8 h-8 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">100% Handcrafted Excellence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every personalized frame, engraved lamp, and floral bouquet is individually handcrafted by skilled artisans in Lucknow.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
              <Truck className="w-8 h-8 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">Express Pan-India Logistics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Partnered with BlueDart, Delhivery & DTDC for same-day delivery in Lucknow & NCR, and 3-5 day express delivery across India.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">Delight Guarantee</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our 7-day hassle-free return/replacement policy ensures total peace of mind for every single order.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TERMS OF USE ─────────────────────────────────────────────────── */}
      {activeView === 'terms' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <SEOHead title="Terms of Use - ShriMaruti" />
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Terms of Use & Service Agreement</h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: January 2026 · Shri Maruti Internet Pvt Ltd</p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">1. Acceptance of Terms</h3>
              <p>By accessing or using ShriMaruti.com, placing an order, or interacting with our services, you agree to be bound by these Terms of Use and all applicable laws and regulations of India.</p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">2. Custom & Personalized Product Policy</h3>
              <p>For custom photo gifts (such as 3D acrylic lamps, Spotify plaques, or engraved wooden boxes), users are responsible for uploading high-resolution, clear images. Cancellations are valid only within 1 hour of order placement before manufacturing begins.</p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">3. Pricing & Taxes</h3>
              <p>All prices listed on ShriMaruti.com are in Indian Rupees (INR) and include GST unless stated otherwise. Delivery charges, gift-wrap fees, and discounts are itemized at checkout.</p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">4. Delivery OTP & Verification</h3>
              <p>Orders shipped via express courier require 6-digit OTP verification upon arrival. Delivery is deemed complete once OTP is shared with the courier agent.</p>
            </section>
          </div>
        </div>
      )}

      {/* ── SECURITY & PRIVACY POLICY ────────────────────────────────────── */}
      {activeView === 'privacy' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <SEOHead title="Security & Privacy Policy - ShriMaruti" />
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Security & Privacy Policy</h1>
            <p className="text-xs text-slate-500 mt-1">256-Bit SSL Encrypted Security · IT Act 2000 Compliant</p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">1. Commitment to Data Privacy</h3>
              <p>ShriMaruti respects your personal data. We never sell, rent, or trade customer phone numbers, emails, or delivery recipient details to third-party advertisers.</p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">2. Secure Payments</h3>
              <p>Online transactions are handled via Razorpay's PCI-DSS Level 1 compliant gateway with 256-bit encryption. Payment credentials (card numbers, UPI PINs) are never stored on ShriMaruti servers.</p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">3. Personalized Photo Data Safety</h3>
              <p>User-uploaded photographs for gift customization are stored securely and used solely for fulfilling your order. Photos are automatically purged from our cloud storage after 30 days of order delivery.</p>
            </section>
          </div>
        </div>
      )}

      {/* ── SHIPPING & DELIVERY POLICY ───────────────────────────────────── */}
      {activeView === 'shipping' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <SEOHead title="Express Shipping & Delivery Policy - ShriMaruti" />
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Express Shipping & Delivery Policy</h1>
            <p className="text-xs text-slate-500 mt-1">Same-Day Lucknow Delivery · 3-5 Days Pan-India</p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900">⚡ Express City Delivery (Lucknow / NCR)</span>
                <p className="text-amber-800">Orders placed before 2:00 PM are delivered same-day via local express logistics partners.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900">✈️ Standard Pan-India Shipping</span>
                <p className="text-slate-600">Free delivery on orders over ₹499. Flat ₹70 charge for orders below ₹499. Delivered in 3-5 business days.</p>
              </div>
            </div>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">OTP Delivery Handover</h3>
              <p>When your parcel is out for delivery, a 6-digit OTP is sent to your registered email and mobile number. Please share this OTP with the delivery executive at your doorstep to confirm receipt.</p>
            </section>
          </div>
        </div>
      )}

      {/* ── CANCELLATION & RETURN POLICY ─────────────────────────────────── */}
      {activeView === 'return' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <SEOHead title="Cancellation & Return Policy - ShriMaruti" />
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Cancellation & Return Policy</h1>
            <p className="text-xs text-slate-500 mt-1">7-Day Window · Photo Verification · Instant Refund via Return OTP</p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">1. Return Eligibility Window</h3>
              <p>Products with return eligibility can be returned within <strong>7 days</strong> of delivery. The countdown decreases daily on your Order Details page.</p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">2. Photo Proof Request Process</h3>
              <p>To request a return or replacement for damaged, incorrect, or defective products, navigate to <strong>My Orders → Request Return</strong>, upload a photo of the product, and select a return reason.</p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">3. Return OTP & Refund Execution</h3>
              <p>Once approved by Admin, a Return Pickup OTP is generated and emailed to you. Hand over the parcel to the pickup agent and share the OTP. Upon OTP verification, the refund transaction is initiated automatically to your original payment method.</p>
            </section>
          </div>
        </div>
      )}

      {/* ── GRIEVANCE REDRESSAL ───────────────────────────────────────────── */}
      {activeView === 'grievance' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <SEOHead title="Grievance Redressal - ShriMaruti" />
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Grievance Redressal & Nodal Officer</h1>
            <p className="text-xs text-slate-500 mt-1">Under Information Technology Act 2000 & Consumer Protection Rules</p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <p>If you have any unresolved complaints, grievances, or issues regarding your orders or data privacy, you can contact our designated Grievance Officer:</p>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900 text-sm">Mr. Ankit Srivastava (Nodal Officer)</p>
              <p>Shri Maruti Internet Pvt Ltd</p>
              <p>Hazratganj Main Market, Lucknow, UP - 226001, India</p>
              <p>Email: <strong className="text-amber-700">grievance@shrimaruti.com</strong></p>
              <p>Phone: <strong>1800-419-7700</strong> (Ext: 4)</p>
            </div>

            <p className="text-slate-500">All grievances will be acknowledged within 24 hours and resolved within 15 working days.</p>
          </div>
        </div>
      )}

      {/* ── EPR COMPLIANCE ───────────────────────────────────────────────── */}
      {activeView === 'epr' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <SEOHead title="EPR Compliance & Sustainability - ShriMaruti" />
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Extended Producer Responsibility (EPR) Compliance</h1>
            <p className="text-xs text-slate-500 mt-1">Eco-Friendly Packaging & E-Waste Management</p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <p>Shri Maruti Internet Pvt Ltd is committed to environmental stewardship and strict adherence to CPCB (Central Pollution Control Board) EPR guidelines:</p>

            <ul className="space-y-2 list-disc pl-5">
              <li><strong>100% Recyclable Packaging:</strong> All gift boxes, bubble wraps, and craft paper sleeves are made from recycled or biodegradable materials.</li>
              <li><strong>Electronic Waste Management:</strong> 3D LED lamp bases and electronic battery components can be returned at our designated collection centers for eco-friendly recycling.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── CAREERS ──────────────────────────────────────────────────────── */}
      {activeView === 'careers' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <SEOHead title="Careers & Hiring - ShriMaruti" />
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Careers at Shri Maruti</h1>
            <p className="text-xs text-slate-500 mt-1">Join India's Fastest Growing Gifting Brand</p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <p>We are always hiring talented designers, logistics coordinators, customer support champions, and full-stack developers!</p>

            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Product Design Specialist (3D Acrylic & Lamps)</h4>
                  <p className="text-slate-500 text-[11px]">Full-time · Lucknow HQ</p>
                </div>
                <a href="mailto:careers@shrimaruti.com" className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-xl">Apply Now</a>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Customer Support & Gifting Advisor</h4>
                  <p className="text-slate-500 text-[11px]">Full-time / Remote · 24x7 Shifts</p>
                </div>
                <a href="mailto:careers@shrimaruti.com" className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-xl">Apply Now</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRESS & MEDIA ───────────────────────────────────────────────── */}
      {activeView === 'press' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <SEOHead title="Press & Media - ShriMaruti" />
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Press & Media Coverage</h1>
            <p className="text-xs text-slate-500 mt-1">Shri Maruti in News & Media</p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase">The Times of India · 2025</span>
                <h4 className="font-bold text-slate-900">"How Shri Maruti Revolutionized Personalized Gifting in North India"</h4>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Economic Times · 2025</span>
                <h4 className="font-bold text-slate-900">"Top 10 D2C Festive Gifting Platforms Expanding Pan-India"</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GROUP VENTURES ──────────────────────────────────────────────── */}
      {activeView === 'group' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <SEOHead title="Shri Maruti Group Companies" />
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Shri Maruti Group Ventures</h1>
            <p className="text-xs text-slate-500 mt-1">Specialized Excellence Across Gifting Verticals</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-2">
              <h3 className="font-extrabold text-amber-900 text-sm">🌸 Shri Maruti Flora</h3>
              <p className="text-amber-800">Fresh flower bouquet sourcing from exotic farms with midnight & express delivery across 150+ Indian cities.</p>
            </div>

            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-200 space-y-2">
              <h3 className="font-extrabold text-indigo-900 text-sm">🔮 Shri Maruti 3D Studio</h3>
              <p className="text-indigo-800">Precision laser engraving & 3D illusion acrylic lamps crafted with high-grade optical acrylic and wooden LED bases.</p>
            </div>

            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 space-y-2">
              <h3 className="font-extrabold text-rose-900 text-sm">🧁 Shri Maruti Bakes</h3>
              <p className="text-rose-800">Artisan cakes, eggless bakery delights, and luxury chocolate truffles baked fresh for every celebration.</p>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2">
              <h3 className="font-extrabold text-emerald-900 text-sm">👑 Shri Maruti Luxe</h3>
              <p className="text-emerald-800">Bespoke corporate hampers, gold-plated keepsakes, and velvet rigid box presentations for high-profile gifting.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyPolicyPages;
