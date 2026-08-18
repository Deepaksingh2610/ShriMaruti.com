import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { FileText, Shield, AlertCircle, Scale, CheckCircle2 } from 'lucide-react';
import { useCompanySettings } from '../hooks/useCompanySettings';

const TermsOfUsePage = () => {
  const { settings: companyConfig } = useCompanySettings();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Terms of Use - Shri Maruti"
        description="Review the terms, conditions, and user agreement governing access to and transactions on ShriMaruti.com."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Consumer Policy</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Terms of Use</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <Scale className="w-3.5 h-3.5" />
          <span>Legal & User Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Terms of Use
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Please read these Terms of Use carefully before accessing or using the ShriMaruti.com website and associated gifting services.
        </p>
        <p className="text-xs font-mono text-amber-400">
          Last Updated: {companyConfig.legal.lastUpdatedDate}
        </p>
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        
        {/* 1. Acceptance of Terms */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">1</span>
            Acceptance of Terms
          </h2>
          <p>
            By accessing or using ShriMaruti.com, creating an account, or placing an order, users agree to comply with and be bound by these Terms of Use and all applicable laws and regulations of India. If you do not agree with any part of these terms, you should discontinue using the platform.
          </p>
        </section>

        {/* 2. Website Usage */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">2</span>
            Website Usage & Responsible Conduct
          </h2>
          <p>
            Users must use the website lawfully and responsibly. Users must not:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600">
            <li>Attempt unauthorized access to any portion of the website, servers, or connected networks.</li>
            <li>Interfere with or disrupt website functionality, performance, or user experience.</li>
            <li>Submit fraudulent, deceptive, or misleading information during registration or checkout.</li>
            <li>Abuse promotional codes, referral programs, or system vulnerabilities.</li>
            <li>Use automated systems, scrapers, bots, or spiders in a way that harms or overburdens the service.</li>
            <li>Copy, distribute, reverse-engineer, or misuse website content, assets, or software without prior written permission.</li>
          </ul>
        </section>

        {/* 3. Products & Information */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">3</span>
            Products & Information
          </h2>
          <p>
            Product descriptions, images, prices, availability, and other information displayed on ShriMaruti.com are subject to change and may be updated from time to time. We strive for high accuracy in item displays; however, slight variations in natural materials (e.g. wood grain in photo frames or floral arrangements) may occur due to artisanal crafting.
          </p>
        </section>

        {/* 4. Orders */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">4</span>
            Orders & Confirmation
          </h2>
          <p>
            An order is subject to product availability, payment confirmation, address validation, and other applicable conditions. Shri Maruti reserves the right to decline or cancel an order in circumstances involving pricing errors, incomplete address details, or potential payment fraud.
          </p>
        </section>

        {/* 5. Intellectual Property */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">5</span>
            Intellectual Property
          </h2>
          <p>
            All website content, branding, logos, graphics, icons, images, product designs, text, and software code are the intellectual property of Shri Maruti or its content suppliers and may be protected by applicable intellectual property, copyright, and trademark laws.
          </p>
        </section>

        {/* 6. Third-Party Services */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">6</span>
            Third-Party Services
          </h2>
          <p>
            The website may integrate third-party services for payment gateway processing, analytics, delivery logistics, authentication, and communication. Users interact with such third-party providers subject to their respective terms and policies.
          </p>
        </section>

        {/* 7. Changes to Terms */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">7</span>
            Modifications & Updates
          </h2>
          <p>
            Shri Maruti may update these Terms of Use from time to time. Continued access or use of the website following the posting of any modifications constitutes acceptance of the revised terms.
          </p>
        </section>

      </div>
    </div>
  );
};

export default TermsOfUsePage;
