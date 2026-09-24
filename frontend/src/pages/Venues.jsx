import React, { useEffect, useState } from 'react';
import { venueApi } from '../api/venueApi';
import { eventApi } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { 
  Building, 
  MapPin, 
  Users, 
  DollarSign, 
  Search, 
  Check, 
  Sparkles, 
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const Venues = () => {
  const { isAuthenticated } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Event Booking modal state
  const [userEvents, setUserEvents] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (minCapacity) params.min_capacity = parseInt(minCapacity);
      if (maxPrice) params.max_price = parseFloat(maxPrice);

      const res = await venueApi.getVenues(params);
      setVenues(res.data.venues || []);
    } catch (err) {
      console.error("Venues fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [minCapacity, maxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVenues();
  };

  const handleOpenBookingModal = async (venue) => {
    setSelectedVenue(venue);
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
        console.error("Failed to load user events:", err);
      }
    }
  };

  const handleConfirmVenueSelection = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !selectedVenue) return;
    setBookingError('');
    try {
      await venueApi.selectVenueForEvent(selectedEventId, selectedVenue.id);
      setBookingSuccess(`"${selectedVenue.name}" successfully assigned to your event!`);
      setTimeout(() => {
        setSelectedVenue(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.error || 'Failed to assign venue.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
          <Building className="w-3.5 h-3.5" />
          <span>Premier Event Spaces</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Venues Directory</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Discover ballrooms, scenic rooftop terraces, royal heritage courtyards, and convention halls with live availability.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venue name, city, facilities..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none"
          >
            <option value="">Any Capacity</option>
            <option value="150">150+ Guests</option>
            <option value="300">300+ Guests</option>
            <option value="500">500+ Guests</option>
            <option value="800">800+ Guests</option>
          </select>

          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none"
          >
            <option value="">Any Price</option>
            <option value="1500">Under $1,500</option>
            <option value="2500">Under $2,500</option>
            <option value="3500">Under $3,500</option>
            <option value="5000">Under $5,000</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setMinCapacity('');
              setMaxPrice('');
              fetchVenues();
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Venues Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : venues.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <Building className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No venues found matching filters</h3>
          <p className="text-xs text-slate-500">Try widening your capacity or price range.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={venue.image_url}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur shadow text-slate-900 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-brand-600" />
                    <span>Up to {venue.capacity} guests</span>
                  </div>
                  {venue.is_available && (
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow">
                      Available
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{venue.location}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {venue.description}
                  </p>

                  {/* Facilities Chips */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {venue.facilities.slice(0, 4).map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {f}
                      </span>
                    ))}
                    {venue.facilities.length > 4 && (
                      <span className="px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 text-[10px] font-bold">
                        +{venue.facilities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Booking Price</span>
                  <div className="text-xl font-extrabold text-slate-900">${venue.price.toLocaleString()}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBookingModal(venue)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Select For Event</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Select Venue For Event Modal */}
      <Modal
        isOpen={!!selectedVenue}
        onClose={() => setSelectedVenue(null)}
        title={`Book Venue: ${selectedVenue?.name}`}
      >
        {!isAuthenticated ? (
          <div className="text-center py-6 space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Sign in to book this venue</h4>
            <p className="text-xs text-slate-500">You need an active organizer account to attach venues to your event.</p>
            <div className="flex justify-center gap-3 pt-2">
              <a href="/login" className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow">
                Log In
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmVenueSelection} className="space-y-4">
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
              <p><span className="font-bold text-slate-800">Venue:</span> {selectedVenue?.name}</p>
              <p><span className="font-bold text-slate-800">Location:</span> {selectedVenue?.location}</p>
              <p><span className="font-bold text-slate-800">Rental Price:</span> ${selectedVenue?.price}</p>
              <p><span className="font-bold text-slate-800">Capacity:</span> Up to {selectedVenue?.capacity} attendees</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Your Event to Attach This Venue *
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

            <p className="text-[11px] text-slate-400">
              Attaching this venue will update the event's location and automatically create a matching expense entry.
            </p>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedVenue(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              {userEvents.length > 0 && (
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  Confirm Venue Selection
                </button>
              )}
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
