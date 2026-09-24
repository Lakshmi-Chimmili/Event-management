import React, { useEffect, useState } from 'react';
import { feedbackApi } from '../api/feedbackApi';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  User
} from 'lucide-react';

export const Feedback = () => {
  const { isAuthenticated } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(5.0);

  // Form
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('Platform');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadFeedbacks = async () => {
    try {
      const res = await feedbackApi.getFeedback();
      setFeedbacks(res.data.feedbacks || []);
      setAvgRating(res.data.average_rating || 5.0);
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await feedbackApi.submitFeedback({
        rating,
        category,
        comment: comment.trim()
      });
      setSuccess('Thank you! Your review has been submitted.');
      setComment('');
      setRating(5);
      loadFeedbacks();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>User Reviews & Experiences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Feedback & Ratings</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Share your event planning experience, suggest enhancements, and read testimonials from hosts and organizers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Submit Feedback Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-5 h-fit">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Leave Your Review</h3>
            <p className="text-xs text-slate-500">Rate your experience using EventEase</p>
          </div>

          {!isAuthenticated ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <p className="font-semibold">Sign in required</p>
              <p className="text-slate-600">Please sign in to submit a verified rating.</p>
              <a href="/login" className="inline-block px-4 py-1.5 rounded-lg bg-brand-600 text-white font-bold text-xs">
                Log In
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Star Rating Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-200 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-700">{rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Review Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                >
                  <option value="Platform">Platform & Ease of Use</option>
                  <option value="Budgeting">Smart Budgeting & Expenses</option>
                  <option value="Venues">Venue Booking Experience</option>
                  <option value="Vendors">Vendor & Service Quality</option>
                  <option value="RSVP">Digital Invitations & RSVP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Review / Suggestions *
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked about planning your event with EventEase..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Post Feedback'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Feedback List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Community Reviews</h3>
              <p className="text-xs text-slate-500">{feedbacks.length} Verified user entries</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{avgRating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200/80">
              <p className="text-xs text-slate-500">No feedback submitted yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs uppercase">
                        {fb.user_name?.[0] || 'U'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{fb.user_name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(fb.created_at).toLocaleDateString()} • {fb.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-10">
                    "{fb.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
