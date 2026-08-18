import React from 'react';
import { Link } from 'react-router-dom';
import { PackageX, Home, Search } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const NotFoundPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50 flex items-center justify-center px-4">
    <SEOHead title="404 - Page Not Found" />
    <div className="text-center space-y-6 max-w-md">
      <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
        <PackageX className="w-12 h-12 text-amber-600" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-black text-amber-600">404</h1>
        <h2 className="text-2xl font-extrabold text-slate-900">Oops! Gift Not Found</h2>
        <p className="text-sm text-slate-500">
          The page you're looking for doesn't exist or has been moved. Let us help you find the perfect gift!
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition">
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link to="/products" className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition">
          <Search className="w-4 h-4" /> Browse Gifts
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
