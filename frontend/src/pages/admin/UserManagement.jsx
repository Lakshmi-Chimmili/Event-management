import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { AdminLayout } from './AdminLayout';
import { Modal } from '../../components/common/Modal';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Trash2, 
  Power, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user) => {
    setActionMsg('');
    setActionError('');
    try {
      const res = await adminApi.toggleUserActive(user.id);
      setActionMsg(res.data.message);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.error || 'Failed to toggle user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setActionMsg('');
    setActionError('');
    try {
      const res = await adminApi.deleteUser(deleteUserId);
      setActionMsg(res.data.message);
      setDeleteUserId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.error || 'Failed to delete user');
      setDeleteUserId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="User Management" subtitle="Audit platform accounts, toggle access, and manage organizer credentials">
      <div className="space-y-6">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-amber-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Total Accounts: <span className="text-slate-900 font-bold">{users.length}</span>
          </div>
        </div>

        {actionMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {actionError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Events</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] uppercase">
                        {u.name?.[0] || 'U'}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4 text-slate-400">{u.phone || '-'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{u.total_events}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'ADMIN' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(u)}
                            title={u.is_active ? "Deactivate User" : "Activate User"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.is_active 
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' 
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteUserId(u.id)}
                            title="Delete User"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteUserId}
          onClose={() => setDeleteUserId(null)}
          title="Confirm User Account Deletion"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this user account? All events organized by this user will also be deleted from MySQL.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteUserId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </AdminLayout>
  );
};
