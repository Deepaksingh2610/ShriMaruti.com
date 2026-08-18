import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { Leaf, ShieldCheck, FileText, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { useCompanySettings } from '../hooks/useCompanySettings';

const EprCompliancePage = () => {
  const { settings: companyConfig } = useCompanySettings();
  const { epr } = companyConfig;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="EPR Compliance - Shri Maruti"
        description="Extended Producer Responsibility (EPR) compliance information, packaging sustainability, and environmental stewardship at Shri Maruti."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Consumer Policy</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">EPR Compliance</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
          <Leaf className="w-3.5 h-3.5" />
          <span>Environmental Stewardship</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          EPR Compliance
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Extended Producer Responsibility (EPR) is an environmental policy approach in which a producer's responsibility for a product is extended to the post-consumer stage of its life cycle.
        </p>
      </div>

      {/* Compliance Status Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Extended Producer Responsibility Status</h2>
          <p className="text-xs text-slate-500 mt-1">Official compliance disclosure</p>
        </div>

        {epr.isConfigured ? (
          <div className="space-y-6 text-xs sm:text-sm text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500 block">EPR Registration Number</span>
                <p className="font-mono font-bold text-slate-900">{epr.registrationNumber}</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500 block">Applicable Category</span>
                <p className="font-bold text-slate-900">{epr.category}</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500 block">Responsible Entity</span>
                <p className="font-bold text-slate-900">{epr.responsibleEntity}</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500 block">Contact Information</span>
                <p className="font-mono font-bold text-slate-900">{epr.contactEmail}</p>
              </div>
            </div>

            {epr.officialDocuments && epr.officialDocuments.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-bold text-slate-900">Official Documents:</h3>
                <div className="flex flex-wrap gap-3">
                  {epr.officialDocuments.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-2 text-xs"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                      {doc.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 sm:p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 mx-auto animate-spin-slow" />
            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed max-w-lg mx-auto">
              EPR compliance information is currently being updated. Please check this page again for the latest official information.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We strictly publish company-approved, verified regulatory compliance information.
            </p>
          </div>
        )}
      </section>

      {/* Sustainable Practices Overview */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Sustainable Packaging & Eco-Conscious Operations</h2>
          <p className="text-xs text-slate-500 mt-1">Our ongoing commitment to reducing ecological footprint</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-slate-600 leading-relaxed">
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm text-emerald-950">Recyclable Outer Packaging</h3>
            <p>Our gift boxes, corrugated shipping sleeves, and protective cushions prioritize paper-based and recyclable materials.</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm text-emerald-950">Responsible E-Waste Handling</h3>
            <p>Components used in electronic bases and LED lamps are designed for disassembly and standard e-waste collection.</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm text-emerald-950">Continuous Optimization</h3>
            <p>We work in tandem with our supply partners to minimize unnecessary plastic wrap and non-biodegradable packaging elements.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EprCompliancePage;
