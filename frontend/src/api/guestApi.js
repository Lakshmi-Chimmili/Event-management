import axiosClient from './axiosClient';

export const guestApi = {
  getGuestsByEvent: (eventId, params) => axiosClient.get(`/events/${eventId}/guests`, { params }),
  addGuest: (eventId, guestData) => axiosClient.post(`/events/${eventId}/guests`, guestData),
  updateGuest: (guestId, guestData) => axiosClient.put(`/guests/${guestId}`, guestData),
  deleteGuest: (guestId) => axiosClient.delete(`/guests/${guestId}`),
};
