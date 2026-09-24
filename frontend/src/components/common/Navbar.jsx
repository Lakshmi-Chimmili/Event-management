import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  PlusCircle, 
  LayoutDashboard, 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  ShieldAlert, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-700 to-pink-600 bg-clip-text text-transparent">
                EventEase
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-brand-100 text-brand-800">
                PRO
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </span>
                </Link>

                <Link
                  to="/events"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/events') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    My Events
                  </span>
                </Link>
              </>
            )}

            <Link
              to="/venues"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/venues') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Venues
              </span>
            </Link>

            <Link
              to="/vendors"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/vendors') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                Vendors
              </span>
            </Link>

            <Link
              to="/feedback"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/feedback') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                Reviews
              </span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50/60'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Admin Portal
                </span>
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/events/create"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 rounded-xl shadow-sm hover:shadow-brand-500/20 shadow-brand-500/10 transition-all transform hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Plan Event</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2 rounded-full border border-slate-200 hover:border-brand-300 transition-colors bg-slate-50 hover:bg-white"
                  >
                    <span className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                      {user?.name?.[0] || 'U'}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 pr-1 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 animate-slide-up z-50"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-800'
                        }`}>
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <User className="w-3.5 h-3.5" />
                        Profile Settings
                      </Link>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Dashboard
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50/50 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm hover:shadow-brand-500/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Events
              </Link>
              <Link
                to="/events/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-brand-600 font-semibold bg-brand-50"
              >
                + Plan New Event
              </Link>
            </>
          )}
          <Link
            to="/venues"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Venues
          </Link>
          <Link
            to="/vendors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Vendors & Services
          </Link>
          <Link
            to="/feedback"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Reviews & Feedback
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-amber-700 bg-amber-50"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700"
                >
                  My Profile ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl bg-brand-600 text-white font-medium shadow-md shadow-brand-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
