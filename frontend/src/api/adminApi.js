import axiosClient from './axiosClient';

export const adminApi = {
  getStats: () => axiosClient.get('/admin/stats'),
  getUsers: () => axiosClient.get('/admin/users'),
  toggleUserActive: (userId) => axiosClient.put(`/admin/users/${userId}/toggle`),
  deleteUser: (userId) => axiosClient.delete(`/admin/users/${userId}`),
  getAllEvents: () => axiosClient.get('/admin/events'),
  updateEventStatus: (eventId, status) => axiosClient.put(`/admin/events/${eventId}/status`, { status }),
  createVenue: (data) => axiosClient.post('/admin/venues', data),
  updateVenue: (id, data) => axiosClient.put(`/admin/venues/${id}`, data),
  deleteVenue: (id) => axiosClient.delete(`/admin/venues/${id}`),
  createVendor: (data) => axiosClient.post('/admin/vendors', data),
  updateVendor: (id, data) => axiosClient.put(`/admin/vendors/${id}`, data),
  deleteVendor: (id) => axiosClient.delete(`/admin/vendors/${id}`),
  getFeedbacks: () => axiosClient.get('/admin/feedback'),
  deleteFeedback: (id) => axiosClient.delete(`/admin/feedback/${id}`),
};
