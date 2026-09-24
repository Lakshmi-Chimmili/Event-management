import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick fill helper for testers and reviewers
  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@eventease.com');
      setPassword('Admin@123');
    } else {
      setEmail('john@eventease.com');
      setPassword('User@123');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-brand-50 text-brand-600 mb-1 shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500">Sign in to manage your events, budgets, and guests</p>
        </div>

        {/* Demo One-Click Login Badges */}
        <div className="p-3 bg-brand-50/60 rounded-2xl border border-brand-100/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-brand-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            Quick Demo Login:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('user')}
              className="px-2.5 py-1 bg-white border border-brand-200 text-brand-700 font-bold rounded-lg hover:bg-brand-50 transition-colors shadow-2xs"
            >
              Organizer User
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="px-2.5 py-1 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors shadow-2xs"
            >
              Admin Portal
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/40">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
