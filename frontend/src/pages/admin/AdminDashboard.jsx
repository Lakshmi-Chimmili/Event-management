import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { AdminLayout } from './AdminLayout';
import { StatCard } from '../../components/common/StatCard';
import { 
  Users, 
  Calendar, 
  Building, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  MessageSquare,
  ArrowRight,
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

const COLORS = ['#f59e0b', '#7c3aed', '#10b981', '#ec4899', '#06b6d4', '#6366f1'];

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await adminApi.getStats();
        setStats(res.data);
      } catch (err) {
        console.error("Admin stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  // Format status data for chart
  const statusChartData = stats?.event_status_distribution ? [
    { name: 'Planning', count: stats.event_status_distribution.Planning || 0 },
    { name: 'Confirmed', count: stats.event_status_distribution.Confirmed || 0 },
    { name: 'Completed', count: stats.event_status_distribution.Completed || 0 },
    { name: 'Cancelled', count: stats.event_status_distribution.Cancelled || 0 },
  ] : [];

  return (
    <AdminLayout title="Platform Analytics & Overview" subtitle="System-wide performance indicators, resource metrics, and activity tracking">
      <div className="space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Registered Users"
            value={stats?.total_users || 0}
            subtitle="Platform accounts"
            icon={Users}
            color="brand"
          />
          <StatCard
            title="Total Events"
            value={stats?.total_events || 0}
            subtitle="All user celebrations"
            icon={Calendar}
            color="amber"
          />
          <StatCard
            title="Venues Catalog"
            value={stats?.total_venues || 0}
            subtitle="Active spaces"
            icon={Building}
            color="emerald"
          />
          <StatCard
            title="Vendor Partners"
            value={stats?.total_vendors || 0}
            subtitle="Service professionals"
            icon={Briefcase}
            color="cyan"
          />
        </div>

        {/* Financial & Volume Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Platform Budget Volume"
            value={`$${(stats?.total_budget_volume || 0).toLocaleString()}`}
            subtitle="Cumulative event budgets"
            icon={DollarSign}
            color="brand"
          />
          <StatCard
            title="Platform Spend Recorded"
            value={`$${(stats?.total_platform_spend || 0).toLocaleString()}`}
            subtitle="Actual ledger costs"
            icon={TrendingUp}
            color="amber"
          />
          <StatCard
            title="Total Guests Tracked"
            value={stats?.total_guests_managed || 0}
            subtitle="RSVP records in system"
            icon={Users}
            color="emerald"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Event Statuses */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Platform Event Statuses</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} Events`, 'Count']} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Events by Category */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Events Distribution By Category</h3>
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
                      innerRadius={45}
                    >
                      {stats.events_by_category.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Events`, 'Count']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No categorized events
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Events Across Entire Platform */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Platform Events</h3>
              <p className="text-xs text-slate-500">Live feed of newly created celebrations across all users</p>
            </div>
            <Link
              to="/admin/events"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>Manage All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Organizer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats?.recent_events || []).map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{e.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{e.organizer_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold text-[10px]">
                        {e.event_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{e.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">${Number(e.total_budget).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        e.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        e.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        e.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {e.status}
                      </span>
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
