import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventApi } from '../api/eventApi';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  HeartHandshake, 
  Cake, 
  Mic2, 
  Building2, 
  GraduationCap, 
  GlassWater,
  ShieldCheck,
  Star
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Birthday Party': Cake,
  'Wedding': HeartHandshake,
  'Engagement': Sparkles,
  'Anniversary': GlassWater,
  'Concert': Mic2,
  'Corporate Event': Building2,
  'Graduation Party': GraduationCap,
};

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await eventApi.getCategories();
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 lg:pb-24">
        {/* Glow background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Next-Generation Smart Event & Party Management System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Plan Unforgettable Events <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Without the Stress
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            From intimate birthday parties and romantic weddings to tech conferences and DJ concerts. 
            Automate budgeting, track guest RSVPs with shareable digital invites, discover elite venues, and book verified vendors in one unified platform.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={isAuthenticated ? "/events/create" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? "Create Your Event Now" : "Get Started For Free"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/venues"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 font-semibold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-brand-500" />
              <span>Explore Venues & Services</span>
            </Link>
          </div>

          {/* Quick Metrics Counter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-slate-200/80">
            <div className="p-4 bg-white/70 backdrop-blur rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-3xl font-extrabold text-brand-600">17+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Event Categories</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-3xl font-extrabold text-slate-900">100%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Automated Budgeting</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-3xl font-extrabold text-brand-600">Real-Time</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Digital RSVP Links</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-3xl font-extrabold text-slate-900">Verified</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Venues & Vendors</p>
            </div>
          </div>

        </div>
      </section>

      {/* Main User Workflow Step-by-Step */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Complete Event Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How EventEase Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From initial concept to guest departures, our intuitive 5-step workflow guarantees nothing slips through the cracks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            { step: '01', title: 'Register & Setup', desc: 'Create account and set up organizer preferences.' },
            { step: '02', title: 'Select Event Type', desc: 'Pick from 17 supported categories and set budget.' },
            { step: '03', title: 'Book Venue & Vendors', desc: 'Select top-rated venues and verified catering/DJ teams.' },
            { step: '04', title: 'Invite & Track RSVP', desc: 'Share digital cards and track confirmations in real-time.' },
            { step: '05', title: 'Track & Complete', desc: 'Manage expense variance, execute checklists, and wrap up.' }
          ].map((item, index) => (
            <div key={index} className="relative p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-brand-200">
              <div>
                <span className="text-3xl font-black text-brand-200 group-hover:text-brand-500 transition-colors">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2 mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center text-xs font-semibold text-brand-600">
                <span>Phase {item.step}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 17 Supported Event Types Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Versatile Planning
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Tailored for Every Celebration & Gathering
            </h2>
          </div>
          <Link
            to="/events/create"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>Plan an Event</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {categories.slice(0, 12).map((cat) => {
            const Icon = CATEGORY_ICONS[cat.name] || Calendar;
            return (
              <div 
                key={cat.id} 
                className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-brand-300 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {cat.description || "Full planning & tracking"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Smart Budget Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Allocate your event budget across 9 standard categories. Automatically calculates estimated vs actual costs, tracks remaining balance, and computes usage percentage with visual alerts.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automated variance calculations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Category-wise distribution charts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Paid vs pending expense tracker</li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Guest & Digital RSVP</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Add guests with contact details and party sizes. Share customized digital invitations where guests can RSVP directly with one click without creating an account.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Instant public RSVP web link</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Accepted, Declined & Pending tallies</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Dietary requirement logging</li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Curated Venues & Vendors</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore ballrooms, rooftop terraces, eco lawns, and concert venues. Book caterers, DJs, photographers, and security directly into your event with synchronized budget items.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Capacity and price range filters</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Facilities check and high-res photos</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> One-click service booking with quote tracking</li>
            </ul>
          </div>

        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-purple-900 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur">
              Start Free Today
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to create your next memorable event?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join thousands of planners and hosts who use EventEase to streamline ceremonies, conferences, and parties.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Link
                to={isAuthenticated ? "/events/create" : "/register"}
                className="px-8 py-3.5 rounded-2xl bg-white text-brand-900 font-bold hover:bg-slate-100 transition-all text-center shadow-lg"
              >
                {isAuthenticated ? "Launch Event Wizard" : "Create Free Account"}
              </Link>
              <Link
                to="/venues"
                className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all text-center border border-white/20 backdrop-blur"
              >
                Browse Venues
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
