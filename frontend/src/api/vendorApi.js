import axiosClient from './axiosClient';

export const vendorApi = {
  getVendors: (params) => axiosClient.get('/vendors', { params }),
  getVendorById: (id) => axiosClient.get(`/vendors/${id}`),
  getEventServices: (eventId) => axiosClient.get(`/vendors/events/${eventId}/services`),
  bookService: (eventId, serviceData) => axiosClient.post(`/vendors/events/${eventId}/services`, serviceData),
  removeService: (serviceId) => axiosClient.delete(`/vendors/events/services/${serviceId}`),
};
