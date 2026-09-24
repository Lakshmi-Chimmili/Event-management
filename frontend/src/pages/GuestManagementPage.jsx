import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../api/eventApi';
import { guestApi } from '../api/guestApi';
import { Users, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const GuestManagementPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [guestForm, setGuestForm] = useState({
    name: '', email: '', phone: '', relationship: 'Friend', rsvp_status: 'Pending', number_of_guests: 1, dietary_notes: ''
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await eventApi.getEvents();
        const evs = res.data.events || [];
        setEvents(evs);
        if (evs.length > 0) {
          setSelectedEventId(String(evs[0].id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const loadGuests = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await guestApi.getGuestsByEvent(eventId);
      setGuests(res.data.guests || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadGuests(selectedEventId);
    }
  }, [selectedEventId]);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      await guestApi.addGuest(selectedEventId, guestForm);
      setModalOpen(false);
      setGuestForm({ name: '', email: '', phone: '', relationship: 'Friend', rsvp_status: 'Pending', number_of_guests: 1, dietary_notes: '' });
      loadGuests(selectedEventId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRSVP = async (guestId, newStatus) => {
    try {
      await guestApi.updateGuest(guestId, { rsvp_status: newStatus });
      loadGuests(selectedEventId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Remove guest?')) return;
    try {
      await guestApi.deleteGuest(guestId);
      loadGuests(selectedEventId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Guest Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">Track RSVPs, contact information, and party headcounts</p>
        </div>

        {events.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 outline-none shadow-xs"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name} ({ev.event_type})</option>
              ))}
            </select>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Guest</span>
            </button>
          </div>
        )}
      </div>

      {events.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500">Create an event first to start managing invitation lists.</p>
          <Link to="/events/create" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Relationship</th>
                  <th className="py-3 px-4">Headcount</th>
                  <th className="py-3 px-4">RSVP Status</th>
                  <th className="py-3 px-4">Dietary Notes</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No guests added to this event yet.
                    </td>
                  </tr>
                ) : (
                  guests.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{g.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {g.email && <div>{g.email}</div>}
                        {g.phone && <div className="text-[11px] text-slate-400">{g.phone}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {g.relationship}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{g.number_of_guests}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={g.rsvp_status}
                          onChange={(e) => handleUpdateRSVP(g.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                            g.rsvp_status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            g.rsvp_status === 'Declined' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{g.dietary_notes || '-'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteGuest(g.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Guest to Event"
      >
        <form onSubmit={handleAddGuest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Guest Full Name *
            </label>
            <input
              type="text"
              required
              value={guestForm.name}
              onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={guestForm.email}
                onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={guestForm.phone}
                onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Relationship
              </label>
              <select
                value={guestForm.relationship}
                onChange={(e) => setGuestForm({ ...guestForm, relationship: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="VIP">VIP</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                RSVP
              </label>
              <select
                value={guestForm.rsvp_status}
                onChange={(e) => setGuestForm({ ...guestForm, rsvp_status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Party Size
              </label>
              <input
                type="number"
                min="1"
                value={guestForm.number_of_guests}
                onChange={(e) => setGuestForm({ ...guestForm, number_of_guests: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
            >
              Save Guest
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
