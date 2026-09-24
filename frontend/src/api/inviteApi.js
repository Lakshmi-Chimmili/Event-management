import axiosClient from './axiosClient';

export const inviteApi = {
  getEventInvitation: (eventId) => axiosClient.get(`/invitations/events/${eventId}/invitation`),
  updateEventInvitation: (eventId, data) => axiosClient.put(`/invitations/events/${eventId}/invitation`, data),
  getPublicInvitation: (code) => axiosClient.get(`/invitations/public/${code}`),
  submitPublicRSVP: (code, rsvpData) => axiosClient.post(`/invitations/public/${code}/rsvp`, rsvpData),
};
