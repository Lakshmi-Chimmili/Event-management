import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { AdminLayout } from './AdminLayout';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const STATUSES = ['Planning', 'Confirmed', 'Completed', 'Cancelled', 'Draft'];

export const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllEvents();
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleStatusChange = async (eventId, newStatus) => {
    setMsg('');
    setError('');
    try {
      const res = await adminApi.updateEventStatus(eventId, newStatus);
      setMsg(res.data.message);
      fetchEvents();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name?.toLowerCase().includes(search.toLowerCase()) ||
                          e.organizer_name?.toLowerCase().includes(search.toLowerCase()) ||
                          e.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Platform Events Management" subtitle="Audit all hosted celebrations, change statuses, and monitor organizer budgets">
      <div className="space-y-6">
        
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event name, host, location..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Events Table */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Organizer</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Budget / Actual</th>
                  <th className="py-3 px-4">Status Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{e.name}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] bg-brand-50 text-brand-700 font-semibold">
                        {e.event_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{e.organizer_name}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{e.date}</div>
                      <div className="text-[11px] text-slate-400">{e.start_time} - {e.end_time}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">{e.location}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">${(e.total_actual_cost || 0).toLocaleString()}</span>
                      <span className="text-slate-400"> / ${(e.total_budget || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={e.status}
                        onChange={(opt) => handleStatusChange(e.id, opt.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                          e.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          e.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          e.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {STATUSES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
