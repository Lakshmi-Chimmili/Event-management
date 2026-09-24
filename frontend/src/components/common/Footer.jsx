import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Award, Calendar, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">EventEase</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Smart Event & Party Management System. Seamlessly plan birthdays, weddings, conferences, graduation galas, and corporate events with automated budgeting, guest RSVPs, and premier venues.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-400" /> Secure JWT Auth
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" /> Enterprise MySQL
              </span>
            </div>
          </div>

          {/* Event Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Event Types</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/events" className="hover:text-white transition-colors">Weddings & Engagements</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Birthday Parties</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Corporate & Conferences</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">DJ, Concerts & Festivals</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Graduations & Reunions</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Organizer Dashboard</Link></li>
              <li><Link to="/venues" className="hover:text-white transition-colors">Venues Directory</Link></li>
              <li><Link to="/vendors" className="hover:text-white transition-colors">Vendors & Catering</Link></li>
              <li><Link to="/feedback" className="hover:text-white transition-colors">Reviews & Ratings</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In / Register</Link></li>
            </ul>
          </div>

          {/* Contact / Major Project specs */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">System Info</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Full-Stack College Major Project & Software Engineering Showcase Architecture.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-brand-400" /> 2026 Academic Edition
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-400" /> admin@eventease.com
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-400" /> React + Flask + MySQL
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} EventEase Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> for full-stack event excellence
          </p>
        </div>
      </div>
    </footer>
  );
};
