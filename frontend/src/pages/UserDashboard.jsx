import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventApi } from '../api/eventApi';
import { StatCard } from '../components/common/StatCard';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Users, 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles
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
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#7c3aed', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#6366f1', '#f43f5e', '#84cc16'];
const RSVP_COLORS = {
  Accepted: '#10b981',
  Pending: '#f59e0b',
  Declined: '#f43f5e',
};

export const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          eventApi.getDashboardStats(),
          eventApi.getEvents()
        ]);
        setStats(statsRes.data);
        setEvents(eventsRes.data.events || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Aggregating your event metrics...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const rsvpChartData = stats?.rsvp_summary ? [
    { name: 'Accepted', value: stats.rsvp_summary.Accepted || 0 },
    { name: 'Pending', value: stats.rsvp_summary.Pending || 0 },
    { name: 'Declined', value: stats.rsvp_summary.Declined || 0 },
  ] : [];

  const budgetProgressData = [
    { name: 'Spent', amount: stats?.total_expenses || 0 },
    { name: 'Remaining', amount: Math.max(0, stats?.remaining_budget || 0) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-purple-900 text-white shadow-xl shadow-brand-950/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Organizer Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Organizer'} 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Here's a comprehensive overview of your active event budgets, guest confirmations, and upcoming celebrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/events/create"
            className="px-5 py-3 rounded-2xl bg-white text-brand-900 font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2 shadow-md hover:shadow-lg shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Event</span>
          </Link>
          <Link
            to="/events"
            className="px-4 py-3 rounded-2xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all border border-white/20 shrink-0"
          >
            My Events
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={stats?.total_events || 0}
          subtitle="All created events"
          icon={Calendar}
          color="brand"
        />
        <StatCard
          title="Upcoming Events"
          value={stats?.upcoming_events || 0}
          subtitle="Active in schedule"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Completed Events"
          value={stats?.completed_events || 0}
          subtitle="Successfully celebrated"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Confirmed Guests"
          value={stats?.total_guests || 0}
          subtitle="Total accepted RSVPs"
          icon={Users}
          color="cyan"
        />
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Budget"
          value={`$${(stats?.total_budget || 0).toLocaleString()}`}
          subtitle="Allocated across all events"
          icon={DollarSign}
          color="brand"
        />
        <StatCard
          title="Total Expenses"
          value={`$${(stats?.total_expenses || 0).toLocaleString()}`}
          subtitle={`Usage: ${stats?.budget_usage_percentage || 0}% of budget`}
          icon={CreditCard}
          color="rose"
        />
        <StatCard
          title="Remaining Budget"
          value={`$${(stats?.remaining_budget || 0).toLocaleString()}`}
          subtitle="Available funds"
          icon={PiggyBank}
          color="emerald"
        />
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Events by Category */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Events by Category</h3>
            <span className="text-xs text-slate-500">Distribution</span>
          </div>
          <div className="h-64">
            {stats?.events_by_category && stats.events_by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.events_by_category}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {stats.events_by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Events`, 'Count']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No events categorized yet
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Budget Usage & Remaining */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Budget Usage vs Remaining</h3>
            <span className="text-xs text-slate-500">Financial Balance</span>
          </div>
          <div className="h-64">
            {stats?.total_budget > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetProgressData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Allocate a budget to see financial utilization
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Expense Categories Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Expenses by Category</h3>
            <span className="text-xs text-slate-500">Actual spend ($)</span>
          </div>
          <div className="h-64">
            {stats?.expense_by_category && stats.expense_by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.expense_by_category} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="category" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Spent']} />
                  <Bar dataKey="amount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No expense entries recorded
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Guest RSVP Status Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Guest RSVP Status</h3>
            <span className="text-xs text-slate-500">Attendee Headcount</span>
          </div>
          <div className="h-64">
            {rsvpChartData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rsvpChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} Guests`, 'Count']} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {rsvpChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RSVP_COLORS[entry.name] || '#7c3aed'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No guests invited yet
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Events Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Active & Recent Events</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage schedules, invite lists, and vendor services</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No events created yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by launching our smart event planner to organize your birthday, wedding, or conference.
            </p>
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-sm hover:bg-brand-700"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Event</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 6).map((ev) => (
              <div
                key={ev.id}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 text-brand-700">
                      {ev.event_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ev.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      ev.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      ev.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {ev.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {ev.name}
                  </h4>

                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ev.date} • {ev.start_time} - {ev.end_time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Budget: </span>
                    <span className="font-bold text-slate-800">${Number(ev.total_budget).toLocaleString()}</span>
                  </div>

                  <Link
                    to={`/events/${ev.id}`}
                    className="font-bold text-brand-600 group-hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
