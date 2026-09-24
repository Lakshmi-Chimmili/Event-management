import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventApi } from '../api/eventApi';
import { venueApi } from '../api/venueApi';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Building,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

export const CreateEvent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
  });

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await venueApi.getVenues({ available_only: true });
        setVenues(res.data.venues || []);
      } catch (err) {
        console.error("Venues fetch error:", err);
      } finally {
        setLoadingVenues(false);
      }
    };
    fetchVenues();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If selecting a venue, auto-fill location if empty
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

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.name.trim() || !formData.event_type) {
        setError('Please enter the event name and choose an event type.');
        return;
      }
    } else if (step === 2) {
      if (!formData.date || !formData.start_time || !formData.end_time || !formData.location.trim()) {
        setError('Please complete the date, timing, and location fields.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        venue_id: formData.venue_id ? parseInt(formData.venue_id) : null
      };

      const res = await eventApi.createEvent(payload);
      
      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const newId = res.data.event.id;
      navigate(`/events/${newId}`);
    } catch (err) {
      console.error("Event creation error:", err);
      setError(err.response?.data?.error || 'Failed to create event. Please check inputs.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-brand-50 text-brand-600 mb-1">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Plan a New Event</h1>
        <p className="text-sm text-slate-500">Configure your celebration parameters, schedule, budget, and venue</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-8 px-4">
        {[
          { num: 1, label: 'Event Details' },
          { num: 2, label: 'Date & Location' },
          { num: 3, label: 'Budget & Venue' }
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step === s.num 
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 ring-4 ring-brand-100'
                  : step > s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[11px] font-semibold ${step === s.num ? 'text-brand-700' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {idx < 2 && (
              <div className={`flex-1 h-0.5 mx-2 -mt-5 ${step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Form Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/40">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: Basic Event Details */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Leo's 10th Birthday Bash or Sarah & John Wedding"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Event Type *
                </label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all bg-white"
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Description / Agenda Notes
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your vision, special requests, timeline, or notes for guests..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Timing & Location */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Start Time *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="time"
                      name="start_time"
                      required
                      value={formData.start_time}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    End Time *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="time"
                      name="end_time"
                      required
                      value={formData.end_time}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Location / Venue Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. 120 Grand Boulevard, West Hall, City Center"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Expected Number of Guests
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    name="number_of_guests"
                    value={formData.number_of_guests}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Venue Selection */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Total Allocated Budget ($ USD) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="50"
                    name="total_budget"
                    required
                    value={formData.total_budget}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-bold text-slate-900 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  You can track individual estimated and actual expenses across 9 categories inside the event dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Venue from Catalog (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    name="venue_id"
                    value={formData.venue_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all bg-white"
                  >
                    <option value="">-- I will decide venue later / Private location --</option>
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Cap: {v.capacity}, ${v.price}) - {v.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Event Confirmation Summary Box */}
              <div className="p-5 rounded-2xl bg-brand-50/60 border border-brand-100 text-xs space-y-2">
                <h4 className="font-bold text-brand-900 uppercase tracking-wider">Configuration Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><span className="font-semibold text-slate-800">Event:</span> {formData.name}</div>
                  <div><span className="font-semibold text-slate-800">Type:</span> {formData.event_type}</div>
                  <div><span className="font-semibold text-slate-800">Date:</span> {formData.date} ({formData.start_time} - {formData.end_time})</div>
                  <div><span className="font-semibold text-slate-800">Guests:</span> ~{formData.number_of_guests} attendees</div>
                  <div className="col-span-2"><span className="font-semibold text-slate-800">Budget:</span> ${Number(formData.total_budget).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Event...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create & Launch Event</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>

    </div>
  );
};
