import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import { Search, MapPin, ShoppingBag, Heart, User, Calendar, Gift, ChevronDown, LogOut, ShieldCheck, Bell, CheckCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useLocationStore } from '../store/useLocationStore';

const fallbackCategories = [
  { name: 'Home Decor', slug: 'home-decor' },
  { name: 'Wooden Earrings', slug: 'wooden-earrings' },
  { name: 'Photo Frame', slug: 'photo-frame' },
  { name: 'Home Living Gifts', slug: 'home-living-gifts' },
  { name: 'Home Essentials Gifts', slug: 'home-essentials-gifts' },
  { name: 'Toy & Puzzle', slug: 'toy-and-puzzle' },
  { name: 'Birthday', slug: 'birthday' },
  { name: 'Anniversary', slug: 'anniversary' },
  { name: 'Personalised', slug: 'personalised' },
  { name: 'Occasions', slug: 'occasions' },
  { name: '3D Designs', slug: '3d-designs' },
  { name: '3D Mandir', slug: '3d-mandir' },
  { name: 'Personalised Photos', slug: 'personalised-photos' },
  { name: '3D Cars', slug: '3d-cars' },
  { name: '3D Cartoon', slug: '3d-cartoon' }
];

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { wishlist } = useWishlistStore();
  const { deliveryPincode, deliveryPlace, deliveryDistrict, deliveryCity, openModal } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const cartCount = getItemCount();

  // Fetch categories dynamically from API
  const { data: categoriesData } = useQuery({
    queryKey: ['navbarCategories'],
    queryFn: async () => {
      const res = await API.get('/categories');
      return res.data.categories;
    }
  });

  // Fetch Notifications for logged-in user
  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ['userNotifications'],
    queryFn: async () => {
      const res = await API.get('/notifications');
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 8000 // Poll every 8s for live payment verification updates
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  const handleMarkAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      refetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = (categoriesData && categoriesData.length > 0) ? categoriesData : fallbackCategories;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedCategory !== 'all') {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory !== 'all' ? selectedCategory : ''}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="bg-gradient-to-tr from-amber-600 to-amber-500 text-white p-2.5 rounded-2xl shadow-md group-hover:scale-105 transition transform">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent tracking-tight">
                Shri Maruti
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block -mt-1">
                .com • Online Store
              </span>
            </div>
          </Link>

          {/* Location Picker (FNP Style) */}
          <button
            onClick={openModal}
            className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-left transition"
          >
            <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="text-[11px] font-medium text-slate-500 block leading-tight">Deliver to</span>
              <span className="text-xs font-bold text-slate-800 block truncate max-w-[160px]">
                {deliveryPlace || deliveryCity} ({deliveryPincode})
              </span>
            </div>
          </button>

          {/* Centered Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden md:flex items-center">
            <div className="relative w-full flex items-center border-2 border-amber-500 rounded-full overflow-hidden shadow-sm hover:shadow-md transition bg-white">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border-r border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id || c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Photo Frames, 3D Mandir, Home Decor..."
                className="w-full px-4 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />

              <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 flex items-center justify-center transition">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Header Action Links */}
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Corporate Gifting Link */}
            <Link to="/corporate-gifting" className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 transition">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Corporate</span>
            </Link>

            {/* My Reminders Link */}
            <Link to="/reminders" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 transition">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Reminders</span>
            </Link>

            {/* Notifications Bell Icon */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-slate-700 hover:text-amber-600 transition"
                  title="Notifications"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-black text-slate-900">Notifications ({unreadCount} new)</h4>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-3.5 hover:bg-slate-50 transition text-xs space-y-1 ${
                              !n.isRead ? 'bg-amber-50/50 font-medium' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                n.type === 'payment_confirmed' ? 'bg-emerald-100 text-emerald-800' : n.type === 'payment_rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {n.title}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(n.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-700 text-[11px] leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Icon with Live Count */}
            <Link to="/cart" className="relative p-2 text-slate-700 hover:text-amber-600 flex items-center gap-2 transition">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-bold text-slate-800">Cart</span>
            </Link>

            {/* Account Dropdown Menu */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-500 transition text-slate-800"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <p className="text-[10px] font-semibold text-amber-600 mt-1">⭐ {user.loyaltyPoints || 0} Loyalty Points</p>
                      </div>

                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-amber-50 flex items-center gap-2.5">
                        <User className="w-4 h-4 text-slate-400" /> My Profile & Addresses
                      </Link>
                      <Link to="/orders" onClick={() => setDropdownOpen(false)} className="px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-amber-50 flex items-center gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-slate-400" /> My Orders & Invoices
                      </Link>
                      <Link to="/gift-cards" onClick={() => setDropdownOpen(false)} className="px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-amber-50 flex items-center gap-2.5">
                        <Gift className="w-4 h-4 text-slate-400" /> Gift Cards
                      </Link>

                      {(user.role === 'admin' || user.role === 'support') && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="px-4 py-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition"
                >
                  <User className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
