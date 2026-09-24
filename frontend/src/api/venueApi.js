import axiosClient from './axiosClient';

export const venueApi = {
  getVenues: (params) => axiosClient.get('/venues', { params }),
  getVenueById: (id) => axiosClient.get(`/venues/${id}`),
  selectVenueForEvent: (eventId, venueId) => axiosClient.post(`/venues/events/${eventId}/select-venue`, { venue_id: venueId }),
};
