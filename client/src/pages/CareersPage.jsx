import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import { Briefcase, Building, MapPin, Clock, Award, CheckCircle2, Mail, Send, X, Users, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCompanySettings } from '../hooks/useCompanySettings';

const CareersPage = () => {
  const { settings: companyConfig } = useCompanySettings();
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applicantForm, setApplicantForm] = useState({
    name: '',
    email: '',
    phone: '',
    portfolio: '',
    message: ''
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['careersJobs'],
    queryFn: async () => {
      try {
        const res = await API.get('/content/jobs');
        return res.data.jobs || [];
      } catch (err) {
        return [];
      }
    }
  });

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!applicantForm.name || !applicantForm.email || !applicantForm.phone) {
      toast.error('Please fill in required contact fields');
      return;
    }
    setIsSubmittingApp(true);
    try {
      const res = await API.post('/content/careers/apply', {
        fullName: applicantForm.name,
        email: applicantForm.email,
        phone: applicantForm.phone,
        portfolioUrl: applicantForm.portfolio,
        coverNote: applicantForm.message,
        roleApplied: selectedJob ? selectedJob.title : 'General Application / Resume',
        jobId: selectedJob?._id || null
      });

      if (res.data?.success) {
        toast.success(`Application submitted (Ref: ${res.data.applicationId})! Our recruitment team will review and contact you.`);
        setApplyModalOpen(false);
        setApplicantForm({ name: '', email: '', phone: '', portfolio: '', message: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Careers - Join Our Team"
        description="Build your career with Shri Maruti. Explore dynamic opportunities in technology, design, operations, marketing, and logistics."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Careers</span>
      </nav>

      {/* Hero Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <Briefcase className="w-3.5 h-3.5" />
          <span>We're Growing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Build Your Career With Shri Maruti
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          We are building a team of passionate people who believe in creating better customer experiences through creativity, technology, operations, and service.
        </p>
        <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
          At Shri Maruti, you can work across different areas including technology, design, sales, marketing, operations, customer support, logistics, production, and business development.
        </p>
      </div>

      {/* Why Work With Us Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Why Work With Us?</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A collaborative environment fostering innovation, leadership, and personal development.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Learn & Grow With Us</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Learn and grow with a developing business with high-impact learning curves.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Real-World Projects</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Work on real-world projects that touch tens of thousands of customer celebration moments.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Cross-Team Collaboration</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Collaborate with different teams across design, engineering, supply chain, and marketing.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Skill Development</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Develop professional and technical skills with mentorship from experienced leads.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Ownership & Autonomy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Opportunity to take ownership and responsibility from day one with genuine agency.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Customer-Focused Environment</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Work in a culture that genuinely prioritizes customer happiness and empathy.</p>
          </div>
        </div>
      </section>

      {/* Current Opportunities Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Current Opportunities</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore open roles across our departments</p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {jobs.length} Open {jobs.length === 1 ? 'Position' : 'Positions'}
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading open positions...</div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id || job.title}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md transition duration-200 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                        {job.department || 'General'}
                      </span>
                      <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location || 'Lucknow / Remote'}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {job.type || 'Full-time'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyClick(job)}
                    className="self-start sm:self-center px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                  >
                    Apply Now
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Job Description:</h4>
                    <p className="leading-relaxed">{job.description}</p>
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">Required Skills & Responsibilities:</h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        {job.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-sm">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Open Positions Currently</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              We currently do not have any open positions. Please check back later for new opportunities.
            </p>
          </div>
        )}
      </section>

      {/* Send Your Resume / General Inquiry */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold">Don't See Your Role? Send Your Resume</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            We are always interested in meeting talented designers, developers, writers, and operations specialists.
          </p>
          <div className="pt-2 text-xs text-slate-300">
            Recruitment Email: <span className="font-mono text-amber-400 font-semibold">{companyConfig.recruitment.email}</span>
          </div>
        </div>

        <button
          onClick={() => handleApplyClick(null)}
          className="flex-shrink-0 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Send Your Resume
        </button>
      </section>

      {/* Apply Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedJob ? `Apply: ${selectedJob.title}` : 'Submit Resume / General Application'}
                </h3>
                <p className="text-[11px] text-slate-500">Shri Maruti Recruitment Team</p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={applicantForm.name}
                  onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })}
                  placeholder="e.g. Priyanshu Sharma"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={applicantForm.email}
                    onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={applicantForm.phone}
                    onChange={(e) => setApplicantForm({ ...applicantForm, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Portfolio / LinkedIn / Resume Link</label>
                <input
                  type="url"
                  value={applicantForm.portfolio}
                  onChange={(e) => setApplicantForm({ ...applicantForm, portfolio: e.target.value })}
                  placeholder="https://linkedin.com/in/... or drive link"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cover Note / Experience Summary</label>
                <textarea
                  rows={3}
                  value={applicantForm.message}
                  onChange={(e) => setApplicantForm({ ...applicantForm, message: e.target.value })}
                  placeholder="Briefly tell us about your experience and why you'd like to join..."
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareersPage;
