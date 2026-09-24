import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../api/eventApi';
import { 
  Calendar, 
  Search, 
  Filter, 
  PlusCircle, 
  MapPin, 
  Users, 
  DollarSign, 
  ArrowRight, 
  Edit, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

const EVENT_STATUSES = ['All', 'Planning', 'Confirmed', 'Completed', 'Cancelled', 'Draft'];

export const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await eventApi.getEvents(params);
      setEvents(res.data.events || []);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const confirmDelete = async () => {
    if (!deleteEventId) return;
    setDeleting(true);
    try {
      await eventApi.deleteEvent(deleteEventId);
      setEvents(events.filter(e => e.id !== deleteEventId));
      setDeleteEventId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyInvite = (event) => {
    const inviteCode = event.invitation?.invitation_code;
    const url = `${window.location.origin}/invite/${inviteCode || event.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(event.id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Events</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize, monitor, and execute all your parties, gatherings, and celebrations
          </p>
        </div>

        <Link
          to="/events/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Event</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, location, or type..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
          />
        </form>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {EVENT_STATUSES.map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No events matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search terms or status filter, or start planning a brand new celebration right away.
          </p>
          <Link
            to="/events/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const usagePct = ev.budget_usage_percentage || 0;
            return (
              <div
                key={ev.id}
                className="rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Top Banner accent */}
                <div className="h-2 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />

                <div className="p-6 space-y-4">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
                      {ev.event_type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      ev.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      ev.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      ev.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {ev.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <Link
                      to={`/events/${ev.id}`}
                      className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1"
                    >
                      {ev.name}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {ev.description || "No description provided."}
                    </p>
                  </div>

                  {/* Date, Time, Location details */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{ev.date} • {ev.start_time} - {ev.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ev.rsvp_summary?.accepted || 0} Accepted ({ev.total_guests_invited} Invited)</span>
                    </div>
                  </div>

                  {/* Budget Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Budget Spent</span>
                      <span className="font-bold text-slate-800">
                        ${(ev.total_actual_cost || 0).toLocaleString()} / ${(ev.total_budget || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePct > 100 ? 'bg-rose-500' : usagePct > 80 ? 'bg-amber-500' : 'bg-brand-600'
                        }`}
                        style={{ width: `${Math.min(100, usagePct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyInvite(ev)}
                      title="Copy Public Invitation Link"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors relative"
                    >
                      <Share2 className="w-4 h-4" />
                      {copiedLink === ev.id && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                          Link Copied!
                        </span>
                      )}
                    </button>
                    <Link
                      to={`/events/${ev.id}/edit`}
                      title="Edit Event"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteEventId(ev.id)}
                      title="Delete Event"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/events/${ev.id}`}
                    className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Manage Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteEventId}
        onClose={() => setDeleteEventId(null)}
        title="Confirm Event Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete this event? All associated guests, RSVPs, expenses, vendor bookings, and invitation links will be removed from MySQL.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setDeleteEventId(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={confirmDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Event'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
