import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../api/eventApi';
import { expenseApi } from '../api/expenseApi';
import { StatCard } from '../components/common/StatCard';
import { DollarSign, CreditCard, PiggyBank, Plus, Trash2, Calendar } from 'lucide-react';
import { Modal } from '../components/common/Modal';

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

export const BudgetExpensesPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    item_name: '', category: 'Food/Catering', estimated_cost: 0, actual_cost: 0, paid_status: 'Unpaid', notes: ''
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await eventApi.getEvents();
        const evs = res.data.events || [];
        setEvents(evs);
        if (evs.length > 0) {
          setSelectedEventId(String(evs[0].id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const loadExpenses = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await expenseApi.getExpensesByEvent(eventId);
      setExpenses(res.data.expenses || []);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadExpenses(selectedEventId);
    }
  }, [selectedEventId]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await expenseApi.addExpense(selectedEventId, form);
      setModalOpen(false);
      setForm({ item_name: '', category: 'Food/Catering', estimated_cost: 0, actual_cost: 0, paid_status: 'Unpaid', notes: '' });
      loadExpenses(selectedEventId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete expense item?')) return;
    try {
      await expenseApi.deleteExpense(id);
      loadExpenses(selectedEventId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Budget & Expense Ledger</h1>
          <p className="text-xs sm:text-sm text-slate-500">Track estimated costs, actual vendor payouts, and variance</p>
        </div>

        {events.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 outline-none shadow-xs"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name} ({ev.event_type})</option>
              ))}
            </select>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        )}
      </div>

      {events.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500">Create an event to start managing expenses and budgets.</p>
          <Link to="/events/create" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              title="Allocated Budget"
              value={`$${(summary?.total_budget || 0).toLocaleString()}`}
              subtitle="Target spending limit"
              icon={DollarSign}
              color="brand"
            />
            <StatCard
              title="Estimated Costs"
              value={`$${(summary?.total_estimated_cost || 0).toLocaleString()}`}
              subtitle="Projected expenses"
              icon={DollarSign}
              color="amber"
            />
            <StatCard
              title="Actual Incurred"
              value={`$${(summary?.total_actual_cost || 0).toLocaleString()}`}
              subtitle={`Used: ${summary?.budget_usage_percentage || 0}%`}
              icon={CreditCard}
              color="rose"
            />
            <StatCard
              title="Remaining Balance"
              value={`$${(summary?.remaining_budget || 0).toLocaleString()}`}
              subtitle={summary?.remaining_budget >= 0 ? "Under budget" : "Exceeded budget!"}
              icon={PiggyBank}
              color={summary?.remaining_budget >= 0 ? 'emerald' : 'rose'}
            />
          </div>

          {/* Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Estimated ($)</th>
                    <th className="py-3 px-4">Actual ($)</th>
                    <th className="py-3 px-4">Variance ($)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">
                        No expenses logged for this event yet.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{exp.item_name}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold text-[10px]">
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
                        <td className="py-3.5 px-4 text-slate-400">{exp.notes || '-'}</td>
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

      {/* Add Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Expense"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                value={form.paid_status}
                onChange={(e) => setForm({ ...form, paid_status: e.target.value })}
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
                value={form.estimated_cost}
                onChange={(e) => setForm({ ...form, estimated_cost: parseFloat(e.target.value) || 0 })}
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
                value={form.actual_cost}
                onChange={(e) => setForm({ ...form, actual_cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
            >
              Add Expense
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
