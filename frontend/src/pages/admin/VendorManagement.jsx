import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { vendorApi } from '../../api/vendorApi';
import { AdminLayout } from './AdminLayout';
import { Modal } from '../../components/common/Modal';
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Phone, 
  CheckCircle2 
} from 'lucide-react';

const CATEGORIES = [
  'Catering',
  'Decoration',
  'Photography',
  'Videography',
  'DJ/Music',
  'Makeup',
  'Invitation',
  'Transportation',
  'Security'
];

export const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Catering',
    contact_name: '',
    email: '',
    phone: '',
    price_range: '$500 - $1,500',
    base_price: 500,
    rating: 4.8,
    description: '',
    image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    is_active: true
  });

  const [msg, setMsg] = useState('');

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getVendors();
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: 'Catering',
      contact_name: '',
      email: '',
      phone: '',
      price_range: '$500 - $1,500',
      base_price: 500,
      rating: 4.8,
      description: '',
      image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      is_active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVendor(v);
    setFormData({
      name: v.name,
      category: v.category,
      contact_name: v.contact_name || '',
      email: v.email || '',
      phone: v.phone || '',
      price_range: v.price_range || '',
      base_price: v.base_price,
      rating: v.rating,
      description: v.description || '',
      image_url: v.image_url || '',
      is_active: v.is_active
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (editingVendor) {
        await adminApi.updateVendor(editingVendor.id, formData);
        setMsg('Vendor updated successfully');
      } else {
        await adminApi.createVendor(formData);
        setMsg('New vendor partner registered');
      }
      setModalOpen(false);
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    try {
      await adminApi.deleteVendor(id);
      setMsg('Vendor removed');
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Vendors & Services Management" subtitle="Register and manage service partners across 9 event categories">
      <div className="space-y-6">
        
        {/* Top Action */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Partner Directory ({vendors.length})</h3>
            <p className="text-xs text-slate-500">Catering, Decorators, DJs, Photography, Videography, Security</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register Vendor</span>
          </button>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((v) => (
            <div key={v.id} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <img src={v.image_url} alt={v.name} className="w-full h-36 object-cover rounded-2xl" />
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-base text-slate-900 line-clamp-1">{v.name}</h4>
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {v.rating}
                    </span>
                  </div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700">
                    {v.category}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">{v.phone} • {v.contact_name}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{v.price_range}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingVendor ? 'Edit Vendor Profile' : 'Register New Vendor'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Base Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Price Range
                </label>
                <input
                  type="text"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  placeholder="$500 - $1,500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rating (1 - 5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Image Photo URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Service Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow"
              >
                {editingVendor ? 'Update Vendor' : 'Register Vendor'}
              </button>
            </div>
          </form>
        </Modal>

      </div>
    </AdminLayout>
  );
};
