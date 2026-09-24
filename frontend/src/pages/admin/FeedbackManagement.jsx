import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { AdminLayout } from './AdminLayout';
import { 
  MessageSquare, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFeedbacks();
      setFeedbacks(res.data.feedbacks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback entry?')) return;
    try {
      await adminApi.deleteFeedback(id);
      setMsg('Feedback deleted');
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Feedback & Review Moderation" subtitle="Review platform feedback and manage community ratings">
      <div className="space-y-6">
        
        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{msg}</span>
          </div>
        )}

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Comment</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No feedback submitted yet.
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((fb) => (
                    <tr key={fb.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{fb.user_name}</div>
                        <div className="text-[11px] text-slate-400">{fb.user_email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{fb.rating} / 5</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {fb.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">
                        "{fb.comment}"
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(fb.id)}
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
    </AdminLayout>
  );
};
