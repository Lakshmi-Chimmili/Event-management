import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi } from '../api/eventApi';
import { venueApi } from '../api/venueApi';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  ArrowLeft, 
  Building, 
  AlertCircle,
  Save,
  CheckCircle2
} from 'lucide-react';

const EVENT_TYPES = [
  "Birthday Party",
  "Wedding",
  "Engagement",
  "Anniversary",
  "Baby Shower",
  "Naming Ceremony",
  "Graduation Party",
  "College Event",
  "Corporate Event",
  "Conference",
  "Workshop",
  "Concert",
  "DJ / Music Event",
  "Festival Event",
  "Family Function",
  "Private Party",
  "Reunion"
];

const STATUS_OPTIONS = ['Draft', 'Planning', 'Confirmed', 'Completed', 'Cancelled'];

export const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    event_type: 'Birthday Party',
    description: '',
    date: '',
    start_time: '18:00',
    end_time: '23:00',
    location: '',
    number_of_guests: 50,
    total_budget: 2500,
    venue_id: '',
    status: 'Planning'
  });

  useEffect(() => {
    const loadEventAndVenues = async () => {
      try {
        const [eventRes, venuesRes] = await Promise.all([
          eventApi.getEventById(id),
          venueApi.getVenues()
        ]);
        const ev = eventRes.data.event;
        setFormData({
          name: ev.name || '',
          event_type: ev.event_type || 'Birthday Party',
          description: ev.description || '',
          date: ev.date || '',
          start_time: ev.start_time || '18:00',
          end_time: ev.end_time || '23:00',
          location: ev.location || '',
          number_of_guests: ev.number_of_guests || 0,
          total_budget: ev.total_budget || 0,
          venue_id: ev.venue_id ? String(ev.venue_id) : '',
          status: ev.status || 'Planning'
        });
        setVenues(venuesRes.data.venues || []);
      } catch (err) {
        console.error("Failed to load event for editing:", err);
        setError("Could not load event data.");
      } finally {
        setLoading(false);
      }
    };
    loadEventAndVenues();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'venue_id' && value) {
      const selected = venues.find(v => v.id === parseInt(value));
      if (selected) {
        setFormData(prev => ({
          ...prev,
          venue_id: value,
          location: `${selected.name}, ${selected.location}`
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        event_type: formData.event_type,
        description: formData.description.trim(),
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location.trim(),
        number_of_guests: parseInt(formData.number_of_guests) || 0,
        total_budget: parseFloat(formData.total_budget) || 0,
        venue_id: formData.venue_id ? parseInt(formData.venue_id) : null,
        status: formData.status
      };

      await eventApi.updateEvent(id, payload);
      setSuccess("Event updated successfully!");
      setTimeout(() => {
        navigate(`/events/${id}`);
      }, 1000);
    } catch (err) {
      console.error("Update failed:", err);
      setError(err.response?.data?.error || 'Failed to update event details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <button
        onClick={() => navigate(`/events/${id}`)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Event Overview</span>
      </button>

      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/40">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Event Details</h1>
          <p className="text-xs text-slate-500">Update event schedule, guest capacity, status, and budget</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white"
              >
                {STATUS_OPTIONS.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Event Type
              </label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white"
              >
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Event Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Guest Capacity
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  name="number_of_guests"
                  value={formData.number_of_guests}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Budget ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  name="total_budget"
                  value={formData.total_budget}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Venue
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                name="venue_id"
                value={formData.venue_id}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-white"
              >
                <option value="">-- No Catalog Venue (Custom Location) --</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.location}) - Capacity: {v.capacity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/events/${id}`)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Changes...' : 'Save Updates'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
