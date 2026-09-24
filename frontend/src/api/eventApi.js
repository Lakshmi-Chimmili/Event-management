import axiosClient from './axiosClient';

export const eventApi = {
  getEvents: (params) => axiosClient.get('/events', { params }),
  getEventById: (id) => axiosClient.get(`/events/${id}`),
  createEvent: (data) => axiosClient.post('/events', data),
  updateEvent: (id, data) => axiosClient.put(`/events/${id}`, data),
  deleteEvent: (id) => axiosClient.delete(`/events/${id}`),
  getDashboardStats: () => axiosClient.get('/events/dashboard-stats'),
  getCategories: () => axiosClient.get('/admin/categories'),
};
