import React, { useEffect, useState } from 'react';
import { vendorApi } from '../api/vendorApi';
import { eventApi } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { 
  Briefcase, 
  Search, 
  Star, 
  Phone, 
  Mail, 
  CheckCircle2, 
  DollarSign, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

const VENDOR_CATEGORIES = [
  'All',
  'Catering',
  'Decoration',
  'Photography',
  'Videography',
  'DJ/Music',
  'Makeup',
  'Invitation',
  'Transportation',
  'Security'
];

export const ServicesVendors = () => {
  const { isAuthenticated } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Booking Modal State
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [agreedPrice, setAgreedPrice] = useState(0);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const res = await vendorApi.getVendors(params);
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error("Failed to load vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleOpenBookingModal = async (vendor) => {
    setSelectedVendor(vendor);
    setAgreedPrice(vendor.base_price || 500);
    setBookingNotes('');
    setBookingSuccess('');
    setBookingError('');

    if (isAuthenticated) {
      try {
        const res = await eventApi.getEvents();
        const activeEvents = (res.data.events || []).filter(e => e.status !== 'Completed' && e.status !== 'Cancelled');
        setUserEvents(activeEvents);
        if (activeEvents.length > 0) {
          setSelectedEventId(String(activeEvents[0].id));
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !selectedVendor) return;
    setBookingError('');

    try {
      await vendorApi.bookService(selectedEventId, {
        vendor_id: selectedVendor.id,
        agreed_price: parseFloat(agreedPrice) || 0,
        notes: bookingNotes.trim()
      });
      setBookingSuccess(`"${selectedVendor.name}" successfully booked! Added to event ledger.`);
      setTimeout(() => {
        setSelectedVendor(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.error || 'Failed to book service.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Professional Vendor Marketplace</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vendors & Event Services</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Connect with trusted catering chefs, decorators, DJs, 4K videographers, makeup artists, and event security bouncers.
        </p>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catering, DJ, photography, decorators..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 shadow-xs"
          />
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {VENDOR_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No vendors found in this category</h3>
          <p className="text-xs text-slate-500">Try selecting "All" or searching with different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Category Banner */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={vendor.image_url}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur text-brand-700 shadow">
                    {vendor.category}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>{vendor.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {vendor.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Contact: {vendor.contact_name || 'Primary Representative'}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {vendor.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vendor.phone}</span>
                    </div>
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Price & Booking Button */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Price Range</span>
                  <div className="text-sm font-bold text-slate-900">{vendor.price_range || `From $${vendor.base_price}`}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBookingModal(vendor)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Book Service</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        title={`Book Vendor: ${selectedVendor?.name}`}
      >
        {!isAuthenticated ? (
          <div className="text-center py-6 space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Sign in to book this vendor</h4>
            <p className="text-xs text-slate-500">You need an active organizer account to book services into your event.</p>
            <div className="flex justify-center gap-3 pt-2">
              <a href="/login" className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow">
                Log In
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking} className="space-y-4">
            {bookingError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
              <p><span className="font-bold text-slate-800">Service Category:</span> {selectedVendor?.category}</p>
              <p><span className="font-bold text-slate-800">Vendor:</span> {selectedVendor?.name}</p>
              <p><span className="font-bold text-slate-800">Rating:</span> ⭐ {selectedVendor?.rating} / 5.0</p>
              <p><span className="font-bold text-slate-800">Phone:</span> {selectedVendor?.phone}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Your Event *
              </label>
              {userEvents.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                  <p>You don't have any active events currently planned.</p>
                  <a href="/events/create" className="font-bold text-brand-600 underline">Create an Event First</a>
                </div>
              ) : (
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
                >
                  {userEvents.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.event_type} - {e.date})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Agreed / Quoted Price ($) *
              </label>
              <input
                type="number"
                min="0"
                step="10"
                required
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Package Notes / Specific Requests
              </label>
              <textarea
                rows={2}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="e.g. 3-course buffet, DJ equipment setup time 4:00 PM, vegetarian choices..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Booking this vendor will record the booking under your event and automatically create an expense item in your ledger.
            </p>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedVendor(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              {userEvents.length > 0 && (
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  Confirm Service Booking
                </button>
              )}
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
