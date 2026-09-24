import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  Users, 
  Calendar, 
  Building, 
  Briefcase, 
  MessageSquare, 
  BarChart3,
  Layers
} from 'lucide-react';

export const AdminLayout = ({ children, title, subtitle }) => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Overview & Stats', icon: BarChart3, exact: true },
    { path: '/admin/users', label: 'User Accounts', icon: Users },
    { path: '/admin/events', label: 'Platform Events', icon: Calendar },
    { path: '/admin/venues', label: 'Manage Venues', icon: Building },
    { path: '/admin/vendors', label: 'Manage Vendors', icon: Briefcase },
    { path: '/admin/feedback', label: 'Feedback Moderation', icon: MessageSquare },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">{title || "Admin Dashboard"}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            {subtitle || "Platform-wide system configuration, monitoring, and catalog management"}
          </p>
        </div>

        <span className="self-start md:self-auto px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
          SUPER ADMIN
        </span>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                active
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Admin Section View */}
      {children}

    </div>
  );
};
