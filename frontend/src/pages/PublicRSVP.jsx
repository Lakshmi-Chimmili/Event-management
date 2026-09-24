import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { inviteApi } from '../api/inviteApi';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PublicRSVP = () => {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // RSVP Form state
  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    email: '',
    phone: '',
    rsvp_status: 'Accepted',
    number_of_guests: 1,
    dietary_notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await inviteApi.getPublicInvitation(code);
        setData(res.data);
      } catch (err) {
        console.error("Public invite error:", err);
        setError("This invitation link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [code]);

  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    if (!rsvpForm.name.trim()) return;
    setSubmitting(true);

    try {
      const res = await inviteApi.submitPublicRSVP(code, rsvpForm);
      setResponseMsg(res.data.message);
      setSubmitted(true);
      if (rsvpForm.rsvp_status === 'Accepted') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit RSVP.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-amber-200">Opening your invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Invitation Unavailable</h2>
          <p className="text-xs text-slate-500">{error || "We couldn't locate this invitation."}</p>
          <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow">
            Go to EventEase Home
          </Link>
        </div>
      </div>
    );
  }

  const { invitation, event } = data;
  const isLav = invitation.template_style === 'Midnight Lavender';
  const isEmerald = invitation.template_style === 'Emerald Botanical';
  const isRose = invitation.template_style === 'Modern Rose';

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center ${
      isLav ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white' :
      isEmerald ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white' :
      isRose ? 'bg-gradient-to-br from-slate-950 via-rose-950 to-slate-900 text-white' :
      'bg-gradient-to-br from-slate-950 via-amber-950 to-stone-900 text-amber-50'
    }`}>
      <div className="max-w-xl w-full space-y-8 animate-slide-up">
        
        {/* Invitation Card */}
        <div className="relative rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl backdrop-blur-xl border border-white/10 bg-white/5">
          
          <div className="inline-flex p-3.5 rounded-full bg-white/10 backdrop-blur shadow-inner">
            <Sparkles className="w-7 h-7 text-amber-400" />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-widest font-bold text-amber-300">
              Cordially Invited By {event.organizer_name}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {event.name}
            </h1>
            <span className="inline-block mt-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white/15 text-white">
              {event.event_type}
            </span>
          </div>

          <p className="text-sm text-slate-300 italic max-w-md mx-auto leading-relaxed">
            "{invitation.custom_message || 'We would be honored by your presence as we celebrate this special day!'}"
          </p>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="font-semibold">{event.date}</p>
                <p className="text-[11px] text-slate-400">{event.start_time} - {event.end_time}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left truncate">
                <p className="font-semibold truncate">{event.location}</p>
                <p className="text-[11px] text-slate-400">Venue</p>
              </div>
            </div>
          </div>

          {invitation.dress_code && (
            <div className="text-xs text-amber-200/90 font-medium">
              👔 Suggested Attire: <span className="font-bold">{invitation.dress_code}</span>
            </div>
          )}
        </div>

        {/* RSVP Form Card */}
        <div className="p-8 rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-100 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-extrabold tracking-tight">Confirm Your Attendance</h3>
            <p className="text-xs text-slate-500">Please let the host know if you can join us</p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">RSVP Confirmed!</h4>
              <p className="text-xs text-emerald-700 leading-relaxed">{responseMsg}</p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-semibold text-emerald-800 underline"
              >
                Need to change your response?
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitRSVP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={rsvpForm.name}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  placeholder="e.g. David Vance"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={rsvpForm.email}
                    onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                    placeholder="david@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={rsvpForm.phone}
                    onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                    placeholder="+1 555-0182"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>

              {/* RSVP Status Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Will you be attending? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRsvpForm({ ...rsvpForm, rsvp_status: 'Accepted' })}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      rsvpForm.rsvp_status === 'Accepted'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Joyfully Accept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRsvpForm({ ...rsvpForm, rsvp_status: 'Declined' })}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      rsvpForm.rsvp_status === 'Declined'
                        ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Regretfully Decline</span>
                  </button>
                </div>
              </div>

              {rsvpForm.rsvp_status === 'Accepted' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Total Attending In Your Party (+1s)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={rsvpForm.number_of_guests}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, number_of_guests: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Dietary Requirements or Notes
                    </label>
                    <input
                      type="text"
                      value={rsvpForm.dietary_notes}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, dietary_notes: e.target.value })}
                      placeholder="e.g. Vegetarian, Gluten-free, Peanut allergy"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting RSVP...' : 'Submit RSVP Confirmation'}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-400">
            Powered by EventEase – Smart Event & Party Management System
          </div>
        </div>

      </div>
    </div>
  );
};
