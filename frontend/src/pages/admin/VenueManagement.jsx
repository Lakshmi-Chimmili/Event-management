import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { venueApi } from '../../api/venueApi';
import { AdminLayout } from './AdminLayout';
import { Modal } from '../../components/common/Modal';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const VenueManagement = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: 200,
    price: 1500,
    facilities: 'Banquet Hall, Stage, AC, Parking, Sound System',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    is_available: true
  });

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await venueApi.getVenues();
      setVenues(res.data.venues || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleOpenAdd = () => {
    setEditingVenue(null);
    setFormData({
      name: '',
      location: '',
      capacity: 200,
      price: 1500,
      facilities: 'Banquet Hall, Stage, AC, Parking, Sound System',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      is_available: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVenue(v);
    setFormData({
      name: v.name,
      location: v.location,
      capacity: v.capacity,
      price: v.price,
      facilities: v.facilities_raw || v.facilities?.join(', ') || '',
      description: v.description || '',
      image_url: v.image_url || '',
      is_available: v.is_available
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      if (editingVenue) {
        await adminApi.updateVenue(editingVenue.id, formData);
        setMsg('Venue updated successfully');
      } else {
        await adminApi.createVenue(formData);
        setMsg('New venue added to catalog');
      }
      setModalOpen(false);
      fetchVenues();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this venue?')) return;
    try {
      await adminApi.deleteVenue(id);
      setMsg('Venue removed');
      fetchVenues();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Venues Management" subtitle="Create, edit, and configure venue facilities and base pricing">
      <div className="space-y-6">
        
        {/* Header Action */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Spaces Catalog ({venues.length})</h3>
            <p className="text-xs text-slate-500">Manage venue capacity, pricing, and amenities</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Venue</span>
          </button>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((v) => (
            <div key={v.id} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <img src={v.image_url} alt={v.name} className="w-full h-36 object-cover rounded-2xl" />
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-base text-slate-900 line-clamp-1">{v.name}</h4>
                    <span className="font-bold text-sm text-amber-600">${v.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{v.location}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span>Capacity: <strong className="text-slate-800">{v.capacity}</strong></span>
                  <span>•</span>
                  <span className={v.is_available ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {v.is_available ? 'Available' : 'Booked'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(v)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingVenue ? 'Edit Venue' : 'Create New Venue'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Venue Name *
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
                Location Address *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Capacity (Max Guests) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rental Price ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Facilities & Amenities (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                placeholder="Grand Stage, Valet Parking, Central AC, Bridal Suite"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
              />
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
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500"
              />
              <label htmlFor="is_available" className="text-xs font-semibold text-slate-700">
                Mark as Available for Booking
              </label>
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
                {editingVenue ? 'Update Venue' : 'Create Venue'}
              </button>
            </div>
          </form>
        </Modal>

      </div>
    </AdminLayout>
  );
};
