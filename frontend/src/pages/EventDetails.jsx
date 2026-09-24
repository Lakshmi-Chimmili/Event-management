import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventApi } from '../api/eventApi';
import { guestApi } from '../api/guestApi';
import { expenseApi } from '../api/expenseApi';
import { vendorApi } from '../api/vendorApi';
import { inviteApi } from '../api/inviteApi';
import { checklistApi } from '../api/checklistApi';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  CheckSquare, 
  Share2, 
  Edit, 
  Trash2, 
  Plus, 
  Sparkles, 
  Building, 
  Briefcase, 
  Mail, 
  Phone, 
  Check, 
  AlertCircle, 
  PieChart as PieIcon, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import confetti from 'canvas-confetti';

const EXPENSE_CATEGORIES = [
  'Venue',
  'Food/Catering',
  'Decoration',
  'Photography',
  'Videography',
  'Music/DJ',
  'Invitations',
  'Transportation',
  'Other'
];

const COLORS = ['#7c3aed', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#6366f1', '#f43f5e', '#84cc16'];

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, guests, budget, vendors, invitation
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Guests State
  const [guests, setGuests] = useState([]);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestForm, setGuestForm] = useState({
    name: '', email: '', phone: '', relationship: 'Friend', rsvp_status: 'Pending', number_of_guests: 1, dietary_notes: ''
  });

  // Expense State
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    item_name: '', category: 'Food/Catering', estimated_cost: 0, actual_cost: 0, paid_status: 'Unpaid', notes: ''
  });

  // Checklist State
  const [checklists, setChecklists] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('General');

  // Booked Services State
  const [services, setServices] = useState([]);

  // Invitation State
  const [invitation, setInvitation] = useState(null);
  const [inviteSaved, setInviteSaved] = useState(false);

  const fetchAllEventData = async () => {
    try {
      const [evRes, guestRes, expRes, servRes, checkRes, invRes] = await Promise.all([
        eventApi.getEventById(id),
        guestApi.getGuestsByEvent(id),
        expenseApi.getExpensesByEvent(id),
        vendorApi.getEventServices(id),
        checklistApi.getChecklist(id),
        inviteApi.getEventInvitation(id)
      ]);

      setEvent(evRes.data.event);
      setGuests(guestRes.data.guests || []);
      setExpenses(expRes.data.expenses || []);
      setExpenseSummary(expRes.data.summary);
      setServices(servRes.data.services || []);
      setChecklists(checkRes.data.tasks || []);
      setInvitation(invRes.data.invitation);
    } catch (err) {
      console.error("Event details load error:", err);
      setError("Unable to load event details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEventData();
  }, [id]);

  // Guest Handlers
  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      await guestApi.addGuest(id, guestForm);
      setGuestModalOpen(false);
      setGuestForm({ name: '', email: '', phone: '', relationship: 'Friend', rsvp_status: 'Pending', number_of_guests: 1, dietary_notes: '' });
      fetchAllEventData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRSVP = async (guestId, newStatus) => {
    try {
      await guestApi.updateGuest(guestId, { rsvp_status: newStatus });
      fetchAllEventData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Remove this guest?')) return;
    try {
      await guestApi.deleteGuest(guestId);
      fetchAllEventData();
    } catch (err) {
      console.error(err);
    }
  };

  // Expense Handlers
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await expenseApi.addExpense(id, expenseForm);
      setExpenseModalOpen(false);
      setExpenseForm({ item_name: '', category: 'Food/Catering', estimated_cost: 0, actual_cost: 0, paid_status: 'Unpaid', notes: '' });
      fetchAllEventData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (expId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseApi.deleteExpense(expId);
      fetchAllEventData();
    } catch (err) {
      console.error(err);
    }
  };

  // Checklist Handlers
  const handleToggleTask = async (taskId) => {
    try {
      await checklistApi.toggleTask(taskId);
      fetchAllEventData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    try {
      await checklistApi.addTask(id, { task_name: newTaskName.trim(), category: newTaskCategory });
      setNewTaskName('');
      fetchAllEventData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await checklistApi.deleteTask(taskId);
      fetchAllEventData();
    } catch (err) {
      console.error(err);
    }
  };

  // Status Change / Complete Event
  const handleStatusChange = async (newStatus) => {
    try {
      await eventApi.updateEvent(id, { status: newStatus });
      if (newStatus === 'Completed') {
        confetti({ particleCount: 150, spread: 80 });
      }
      fetchAllEventData();
    } catch (err) {
      console.error(err);
    }
  };

  // Invitation Save
  const handleSaveInvitation = async (e) => {
    e.preventDefault();
    try {
      await inviteApi.updateEventInvitation(id, invitation);
      setInviteSaved(true);
      setTimeout(() => setInviteSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const copyPublicInviteUrl = () => {
    const url = `${window.location.origin}/invite/${invitation?.invitation_code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <Link to="/events" className="text-brand-600 font-semibold hover:underline">Return to Events</Link>
      </div>
    );
  }

  // Visual calculations
  const totalBudget = Number(event.total_budget) || 0;
  const totalActual = Number(event.total_actual_cost) || 0;
  const remainingBudget = totalBudget - totalActual;
  const budgetUsagePct = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

  // Chart data for categories
  const categoryChartData = Object.entries(expenseSummary?.category_summary || {})
    .filter(([_, val]) => val.actual > 0)
    .map(([cat, val]) => ({ name: cat, amount: val.actual }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Event Identity Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {event.event_type}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                event.status === 'Confirmed' ? 'bg-emerald-500 text-white' :
                event.status === 'Completed' ? 'bg-blue-500 text-white' :
                event.status === 'Cancelled' ? 'bg-rose-500 text-white' :
                'bg-amber-500 text-white'
              }`}>
                {event.status}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{event.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-400" />
                {event.date} ({event.start_time} - {event.end_time})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                {event.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-400" />
                {event.rsvp_summary?.accepted || 0} Confirmed / {event.number_of_guests} Target
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={copyPublicInviteUrl}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/15 flex items-center gap-2 transition-all relative"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? 'Link Copied!' : 'Share RSVP Link'}</span>
            </button>

            <Link
              to={`/events/${id}/edit`}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/15 flex items-center gap-2 transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Details</span>
            </Link>

            {event.status !== 'Completed' ? (
              <button
                onClick={() => handleStatusChange('Completed')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Mark Completed</span>
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('Planning')}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all"
              >
                Reopen Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Budget"
          value={`$${totalBudget.toLocaleString()}`}
          subtitle="Allocated funds"
          icon={DollarSign}
          color="brand"
        />
        <StatCard
          title="Actual Expenses"
          value={`$${totalActual.toLocaleString()}`}
          subtitle={`${budgetUsagePct}% used`}
          icon={CreditCard}
          color={budgetUsagePct > 100 ? 'rose' : 'amber'}
        />
        <StatCard
          title="Remaining Balance"
          value={`$${remainingBudget.toLocaleString()}`}
          subtitle={remainingBudget >= 0 ? "Under budget" : "Over budget!"}
          icon={PiggyBank}
          color={remainingBudget >= 0 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Guests Confirmed"
          value={event.rsvp_summary?.accepted || 0}
          subtitle={`Out of ${guests.length} invited`}
          icon={Users}
          color="cyan"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-2 sm:gap-6 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview & Tasks', count: checklists.length },
            { id: 'guests', label: 'Guest & RSVP List', count: guests.length },
            { id: 'budget', label: 'Budget & Expenses', count: expenses.length },
            { id: 'vendors', label: 'Booked Vendors', count: services.length },
            { id: 'invitation', label: 'Digital Invite Studio', badge: 'Live' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-2 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-pink-100 text-pink-700 uppercase font-black">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT 1: OVERVIEW & TASKS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Event Specs & Venue */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Event Overview</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {event.description || "No specific instructions entered. Use Edit Details to add event guidelines."}
              </p>

              <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Organizer:</span>
                  <span className="font-semibold text-slate-800">{event.organizer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Headcount:</span>
                  <span className="font-semibold text-slate-800">{event.number_of_guests} Guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created On:</span>
                  <span className="font-semibold text-slate-800">{new Date(event.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Venue Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Selected Venue</h3>
                <Link to="/venues" className="text-xs font-semibold text-brand-600 hover:underline">
                  Browse Others
                </Link>
              </div>

              {event.venue ? (
                <div className="space-y-3">
                  <img
                    src={event.venue.image_url}
                    alt={event.venue.name}
                    className="w-full h-36 object-cover rounded-2xl"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{event.venue.name}</h4>
                    <p className="text-xs text-slate-500">{event.venue.location}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Capacity: {event.venue.capacity} people</span>
                    <span className="font-bold text-slate-900">${event.venue.price}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <Building className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">No catalog venue attached yet.</p>
                  <Link
                    to="/venues"
                    className="inline-block px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition-colors"
                  >
                    Select a Venue
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Planning Checklist Tasks */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Planning Checklist & Milestones</h3>
                <p className="text-xs text-slate-500">Keep your event preparations completely organized</p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                {checklists.filter(c => c.is_completed).length} / {checklists.length} Done
              </span>
            </div>

            {/* Add Task Input */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Add milestone task (e.g. Schedule DJ sound check, confirm seating)..."
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
              />
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="General">General</option>
                <option value="Catering">Catering</option>
                <option value="Decoration">Decoration</option>
                <option value="Invitations">Invitations</option>
                <option value="Logistics">Logistics</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Add Task
              </button>
            </form>

            {/* Checklist items list */}
            <div className="space-y-2">
              {checklists.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No tasks listed yet. Add one above.</p>
              ) : (
                checklists.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      task.is_completed 
                        ? 'bg-slate-50/60 border-slate-100 text-slate-400' 
                        : 'bg-white border-slate-200/80 hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          task.is_completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-slate-300 hover:border-brand-500 bg-white'
                        }`}
                      >
                        {task.is_completed && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <p className={`text-xs font-semibold ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.task_name}
                        </p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Tag className="w-2.5 h-2.5" /> {task.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT 2: GUEST MANAGEMENT */}
      {activeTab === 'guests' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Guest List & RSVP Tracker</h3>
              <p className="text-xs text-slate-500">Monitor attendee responses and contact information</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={copyPublicInviteUrl}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-brand-600" />
                <span>{copiedLink ? 'Copied Link' : 'Copy RSVP Link'}</span>
              </button>
              <button
                onClick={() => setGuestModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Guest</span>
              </button>
            </div>
          </div>

          {/* Quick Summary Pill Counters */}
          <div className="grid grid-cols-3 gap-3 max-w-lg">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <p className="text-xl font-black text-emerald-700">{event.rsvp_summary?.accepted || 0}</p>
              <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Accepted</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
              <p className="text-xl font-black text-amber-700">{event.rsvp_summary?.pending || 0}</p>
              <p className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Pending</p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-center">
              <p className="text-xl font-black text-rose-700">{event.rsvp_summary?.declined || 0}</p>
              <p className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">Declined</p>
            </div>
          </div>

          {/* Guest Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Relationship</th>
                  <th className="py-3 px-4">Party Size</th>
                  <th className="py-3 px-4">RSVP Status</th>
                  <th className="py-3 px-4">Dietary / Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No guests added yet. Click "Add Guest" or share the RSVP link.
                    </td>
                  </tr>
                ) : (
                  guests.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
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
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {g.number_of_guests} {g.number_of_guests > 1 ? 'people' : 'person'}
                      </td>
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
                      <td className="py-3.5 px-4 text-slate-500 max-w-[150px] truncate">
                        {g.dietary_notes || '-'}
                      </td>
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

      {/* TAB CONTENT 3: BUDGET & EXPENSES */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Top visual charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Budget Progress Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Budget Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Allocated Budget:</span>
                  <span className="font-bold text-slate-900">${totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Actual Costs:</span>
                  <span className="font-bold text-slate-900">${totalActual.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Estimated Projected:</span>
                  <span className="font-bold text-slate-900">
                    ${(expenseSummary?.total_estimated_cost || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-semibold">Remaining Funds:</span>
                  <span className={`font-black ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${remainingBudget.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                    <span>Usage</span>
                    <span>{budgetUsagePct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budgetUsagePct > 100 ? 'bg-rose-500' : budgetUsagePct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, budgetUsagePct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Expense Categories Breakdown</h3>
                <span className="text-xs text-slate-400 font-medium">Actual Spend</span>
              </div>
              <div className="h-48">
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                        {categoryChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No expense entries with cost recorded
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Expenses Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Expense Ledger</h3>
                <p className="text-xs text-slate-500">Track quotes, deposits, and final vendor payments</p>
              </div>
              <button
                onClick={() => setExpenseModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Estimated ($)</th>
                    <th className="py-3 px-4">Actual ($)</th>
                    <th className="py-3 px-4">Variance ($)</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">
                        No expenses logged yet.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{exp.item_name}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold text-[11px]">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">${Number(exp.estimated_cost).toFixed(2)}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">${Number(exp.actual_cost).toFixed(2)}</td>
                        <td className={`py-3.5 px-4 font-semibold ${exp.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ${Number(exp.variance).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            exp.paid_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            exp.paid_status === 'Partial' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {exp.paid_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 max-w-[150px] truncate">{exp.notes || '-'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
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
        </div>
      )}

      {/* TAB CONTENT 4: BOOKED VENDORS */}
      {activeTab === 'vendors' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Vendors & Service Bookings</h3>
              <p className="text-xs text-slate-500">Manage booked professionals for catering, photography, DJ, and decor</p>
            </div>
            <Link
              to="/vendors"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Browse Vendor Directory
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No vendors booked yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our curated vendors for Catering, Photography, DJ, and Makeup, and book them directly into this event.
              </p>
              <Link
                to="/vendors"
                className="inline-block px-4 py-2 rounded-xl bg-brand-50 text-brand-700 font-bold text-xs hover:bg-brand-100"
              >
                Find Vendors Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand-200 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">
                        {s.service_name}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{s.vendor?.name || 'Vendor Service'}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {s.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div>Contact: {s.vendor?.contact_name || s.vendor?.phone}</div>
                    <div>Phone: {s.vendor?.phone}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Agreed Price:</span>
                    <span className="font-black text-slate-900">${s.agreed_price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: DIGITAL INVITATION STUDIO */}
      {activeTab === 'invitation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card Configurator */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Digital Card Customizer</h3>
              <p className="text-xs text-slate-500">Configure theme, welcome messages, and RSVP link</p>
            </div>

            {inviteSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Invitation saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveInvitation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Visual Theme Style
                </label>
                <select
                  value={invitation?.template_style || 'Royal Gold'}
                  onChange={(e) => setInvitation({ ...invitation, template_style: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
                >
                  <option value="Royal Gold">Royal Gold & Champagne</option>
                  <option value="Midnight Lavender">Midnight Lavender & Neon</option>
                  <option value="Emerald Botanical">Emerald Botanical & Greenery</option>
                  <option value="Modern Rose">Modern Rose & Slate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Host Message / Warm Welcome
                </label>
                <textarea
                  rows={3}
                  value={invitation?.custom_message || ''}
                  onChange={(e) => setInvitation({ ...invitation, custom_message: e.target.value })}
                  placeholder="We cordially invite you to celebrate with us..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dress Code
                </label>
                <input
                  type="text"
                  value={invitation?.dress_code || ''}
                  onChange={(e) => setInvitation({ ...invitation, dress_code: e.target.value })}
                  placeholder="e.g. Formal, Black Tie, Cocktail Chic"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Host Contact Info
                </label>
                <input
                  type="text"
                  value={invitation?.host_contact || ''}
                  onChange={(e) => setInvitation({ ...invitation, host_contact: e.target.value })}
                  placeholder="e.g. Phone or WhatsApp number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Page Views: {invitation?.views_count || 0}</span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Save Invitation
                </button>
              </div>
            </form>
          </div>

          {/* Live Card Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Invitee View</span>
              <a
                href={`/invite/${invitation?.invitation_code}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
              >
                <span>Open Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Themed Preview Card */}
            <div className={`p-8 rounded-3xl text-center space-y-6 shadow-2xl transition-all border ${
              invitation?.template_style === 'Midnight Lavender' 
                ? 'bg-gradient-to-b from-slate-900 to-indigo-950 text-white border-brand-500/30' :
              invitation?.template_style === 'Emerald Botanical'
                ? 'bg-gradient-to-b from-emerald-950 to-slate-900 text-white border-emerald-500/30' :
              invitation?.template_style === 'Modern Rose'
                ? 'bg-gradient-to-b from-rose-950 to-slate-900 text-white border-rose-500/30' :
                'bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 text-amber-100 border-amber-500/30'
            }`}>
              <div className="inline-flex p-3 rounded-full bg-white/10 mb-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold">Special Invitation</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{event.name}</h3>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-white">
                  {event.event_type}
                </span>
              </div>

              <p className="text-xs text-slate-300 italic max-w-sm mx-auto leading-relaxed">
                "{invitation?.custom_message || 'Please join us for a day of memorable celebration.'}"
              </p>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>{event.date} • {event.start_time} to {event.end_time}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{event.location}</span>
                </div>
                {invitation?.dress_code && (
                  <div className="text-[11px] text-amber-200">
                    Dress Code: {invitation.dress_code}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={copyPublicInviteUrl}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all"
                >
                  {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Shareable RSVP Link'}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: Add Guest Modal */}
      <Modal
        isOpen={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        title="Add Guest to Invitation List"
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
              placeholder="e.g. Michael Chang"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={guestForm.email}
                onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                placeholder="michael@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={guestForm.phone}
                onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                placeholder="+1 555-0192"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
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
                <option value="Relative">Relative</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                RSVP Status
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

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Dietary Preferences / Special Notes
            </label>
            <input
              type="text"
              value={guestForm.dietary_notes}
              onChange={(e) => setGuestForm({ ...guestForm, dietary_notes: e.target.value })}
              placeholder="e.g. Vegetarian, Nut Allergy, Wheelchair access"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setGuestModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              Add Guest
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Add Expense Modal */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Add Expense or Budget Item"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Expense Item Description *
            </label>
            <input
              type="text"
              required
              value={expenseForm.item_name}
              onChange={(e) => setExpenseForm({ ...expenseForm, item_name: e.target.value })}
              placeholder="e.g. Floral stage decoration or DJ sound deposit"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Status
              </label>
              <select
                value={expenseForm.paid_status}
                onChange={(e) => setExpenseForm({ ...expenseForm, paid_status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimated Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={expenseForm.estimated_cost}
                onChange={(e) => setExpenseForm({ ...expenseForm, estimated_cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Actual Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={expenseForm.actual_cost}
                onChange={(e) => setExpenseForm({ ...expenseForm, actual_cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Receipt Reference / Notes
            </label>
            <input
              type="text"
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
              placeholder="e.g. Invoice #8892, 50% advance paid"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setExpenseModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-sm"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
