import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { Lock, ShieldCheck, MapPin, EyeOff, FileText, Database, UserCheck, Cookie } from 'lucide-react';
import { useCompanySettings } from '../hooks/useCompanySettings';

const PrivacyPolicyPage = () => {
  const { settings: companyConfig } = useCompanySettings();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Security & Privacy - Shri Maruti"
        description="Learn how Shri Maruti collects, uses, protects, and handles your personal data, location privacy, and transaction security."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Consumer Policy</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Security & Privacy</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <Lock className="w-3.5 h-3.5" />
          <span>Data Protection & Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Security & Privacy Policy
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          We are committed to maintaining transparent data practices and safeguarding the personal information you share with ShriMaruti.com.
        </p>
        <p className="text-xs font-mono text-amber-400">
          Last Updated: {companyConfig.legal.lastUpdatedDate}
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        
        {/* 1. Information We May Collect */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">1</span>
            Information We May Collect
          </h2>
          <p>
            Depending on your interactions and use of website functionality, we may collect the following types of information:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {[
              'Name and Contact Details (Email, Phone number)',
              'Delivery Address & Postal PIN Code',
              'Order History & Customization Notes',
              'Payment Transaction Reference (Non-sensitive)',
              'Account Credentials & Profile Preferences',
              'Device & Browser Information',
              'Website Usage & Analytics Data',
              'Location Information (only when user grants explicit permission)'
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Location Privacy */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">2</span>
            Location Privacy
          </h2>
          <p>
            If the user grants explicit browser or device location permission:
          </p>
          <p>
            The website may process latitude and longitude coordinates solely to determine the user's approximate delivery location, detect nearby service availability, and estimate accurate shipping slots.
          </p>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1">
            <strong>Location Principles:</strong>
            <ul className="list-disc pl-4 space-y-0.5 mt-1">
              <li>We do not request location permissions when it is unnecessary.</li>
              <li>We do not continuously track users in the background without a legitimate feature requirement.</li>
              <li>Users can revoke location permissions at any time through their device/browser settings.</li>
            </ul>
          </div>
        </section>

        {/* 3. How Information Is Used */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">3</span>
            How Information Is Used
          </h2>
          <p>
            Collected information may be used for legitimate business purposes including:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600">
            <li>Processing, manufacturing, and packaging your orders.</li>
            <li>Coordinating delivery with verified logistics partners.</li>
            <li>Providing customer support and order status updates.</li>
            <li>Managing user accounts and authentication.</li>
            <li>Processing secure payments and managing refunds.</li>
            <li>Enhancing website performance and user experience.</li>
            <li>Preventing fraud, abuse, and unauthorized transactions.</li>
            <li>Sending essential order confirmations and delivery OTPs.</li>
          </ul>
        </section>

        {/* 4. Data Security */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">4</span>
            Data Security & Safeguards
          </h2>
          <p>
            Shri Maruti employs reasonable technical and organizational safeguards to protect user information from unauthorized access, loss, or disclosure.
          </p>
          <p className="font-semibold text-slate-900">
            We never expose or store in plain text:
          </p>
          <ul className="list-disc pl-6 space-y-0.5 text-slate-600">
            <li>Account passwords (hashed with industry-standard cryptographic algorithms).</li>
            <li>Authentication tokens or secret keys.</li>
            <li>Credit/debit card numbers, CVVs, or UPI PINs.</li>
            <li>Private customer correspondence or uploaded photos to third-party ad brokers.</li>
          </ul>
        </section>

        {/* 5. Cookies & Tracking Technologies */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">5</span>
            Cookies & Tracking Technologies
          </h2>
          <p>
            We use essential session cookies to maintain your shopping cart, preserve your login session, and secure checkout. Aggregate analytics cookies help us understand platform usage without identifying individual users personally.
          </p>
        </section>

        {/* 6. User Rights */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">6</span>
            Your Rights & Inquiries
          </h2>
          <p>
            Users hold applicable rights regarding their personal data, including the right to request access to stored details, correct outdated information, withdraw optional consents, or request account deletion.
          </p>
          <p className="text-xs text-slate-500">
            For privacy inquiries or data requests, please contact our support desk at <span className="font-mono font-bold text-slate-800">{companyConfig.support.email}</span>.
          </p>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
