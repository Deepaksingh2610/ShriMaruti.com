import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { Newspaper, Mail, Phone, User, Download, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { useCompanySettings } from '../hooks/useCompanySettings';

const PressMediaPage = () => {
  const { settings: companyConfig } = useCompanySettings();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Press & Media - Shri Maruti"
        description="Official press room, media inquiries, brand assets, and official announcements for Shri Maruti."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Press & Media</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Official Communications</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Press & Media
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          For media inquiries, brand information, partnership opportunities, interviews, and official communications related to Shri Maruti, please contact our designated media representative.
        </p>
      </div>

      {/* Media Contact Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Media Contact</h2>
          <p className="text-xs text-slate-500 mt-1">Official point of contact for accredited journalists and media publications</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <User className="w-4 h-4 text-amber-600" />
              <span>Contact Name</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{companyConfig.media.contactName}</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Mail className="w-4 h-4 text-amber-600" />
              <span>Email Address</span>
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">{companyConfig.media.email}</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Phone</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{companyConfig.media.phone}</p>
          </div>
        </div>
      </section>

      {/* Press Releases Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Press Releases</h2>
          <p className="text-xs text-slate-500 mt-1">Official statements, corporate announcements, and releases</p>
        </div>

        <div className="py-8 text-center space-y-2 text-slate-500">
          <p className="text-sm font-semibold text-slate-700">No press releases are currently available.</p>
          <p className="text-xs text-slate-400">Official announcements will be published here as they are released.</p>
        </div>
      </section>

      {/* Media Resources Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Media Resources</h2>
          <p className="text-xs text-slate-500 mt-1">Approved brand assets and reference resources for official press coverage</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Brand Logo Kit</h3>
              <p className="text-xs text-slate-500">Vector SVG and high-resolution PNG logos</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-lg">Available on Request</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Brand Guidelines</h3>
              <p className="text-xs text-slate-500">Typography, color palettes, and logo usage</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-lg">Available on Request</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Official Product Imagery</h3>
              <p className="text-xs text-slate-500">Curated high-res editorial product photos</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-lg">Available on Request</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Company Information Factsheet</h3>
              <p className="text-xs text-slate-500">Overview of group ventures and milestones</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-lg">Available on Request</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PressMediaPage;
