import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import { Calendar, Bell, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RemindersPage = () => {
  const { user, setAuth } = useAuthStore();
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [occasion, setOccasion] = useState('Birthday');
  const [date, setDate] = useState('');

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to save occasion reminders');
      return;
    }
    if (!title || !recipientName || !date) {
      toast.error('Please fill in all reminder fields');
      return;
    }
    try {
      const res = await API.post('/auth/reminders', { title, recipientName, occasion, date });
      if (res.data.success) {
        toast.success('Occasion reminder saved! We will email you 3 days prior.');
        const updatedUser = { ...user, reminders: res.data.reminders };
        setAuth(updatedUser);
        setTitle('');
        setRecipientName('');
        setDate('');
      }
    } catch (err) {
      toast.error('Failed to save reminder');
    }
  };

  const reminders = user?.reminders || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <SEOHead title="Occasion & Date Reminders" />

      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 text-amber-600" /> Never Miss A Special Moment
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Occasion & Birthday Reminders</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Save birthdays and anniversaries of loved ones. We'll send email reminders 3 days before so you can order gifts on time!
        </p>
      </div>

      {/* Add Reminder Form */}
      <form onSubmit={handleAddReminder} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Plus className="w-4 h-4 text-amber-600" /> Add New Occasion Date
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Occasion Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mom's Birthday"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Name *</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Sunita Sharma"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Occasion Type</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
            >
              <option value="Birthday">Birthday</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Festival">Festival</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
            />
          </div>
        </div>

        <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm">
          Save Date Reminder
        </button>
      </form>

      {/* Saved Reminders List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Your Saved Reminders ({reminders.length})</h3>
        {reminders.length === 0 ? (
          <p className="text-xs text-slate-500">No reminders saved yet. Add your first date above!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reminders.map((rem, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rem.title}</h4>
                  <p className="text-[11px] text-slate-500">For: {rem.recipientName} ({rem.occasion})</p>
                  <p className="text-[11px] font-bold text-amber-700 mt-1">📅 {new Date(rem.date).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default RemindersPage;
