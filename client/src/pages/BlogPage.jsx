import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import { FileText, Briefcase, ArrowRight, Calendar } from 'lucide-react';

const BlogPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const res = await API.get('/content/blogs');
      return res.data.blogs;
    }
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await API.get('/content/jobs');
      return res.data.jobs;
    }
  });

  const blogs = data || [];
  const jobs = jobsData || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      <SEOHead title="Gifting Ideas Blog" />

      {/* Blog Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Shri Maruti Ideas & Stories</h1>
          <p className="text-xs text-slate-500 mt-1">Expert tips, gifting guides, and thoughtful ideas for every occasion</p>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading articles...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {blogs.map(blog => (
              <div key={blog._id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition group">
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">{blog.category}</span>
                  <h3 className="text-base font-extrabold text-slate-900 line-clamp-2 group-hover:text-amber-700 transition">{blog.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{blog.excerpt}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(blog.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <Link to={`/blogs/${blog.slug}`} className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
                      Read More <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {blogs.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-400">No articles published yet.</div>
            )}
          </div>
        )}
      </section>

      {/* Careers Section */}
      <section className="space-y-6 border-t border-slate-200 pt-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" /> Join Our Team
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Careers at Shri Maruti</h2>
          <p className="text-xs text-slate-500 mt-1">Help us spread joy across India through thoughtful gifting</p>
        </div>

        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">{job.title}</h3>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{job.department}</span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{job.location}</span>
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">{job.type}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{job.description}</p>
              </div>
              <a
                href={`mailto:careers@shrimaruti.com?subject=Application for ${job.title}`}
                className="flex-shrink-0 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Apply Now
              </a>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200">No open positions at the moment. Check back soon!</div>
          )}
        </div>
      </section>

    </div>
  );
};

export default BlogPage;
