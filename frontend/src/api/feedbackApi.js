import axiosClient from './axiosClient';

export const feedbackApi = {
  getFeedback: () => axiosClient.get('/feedback'),
  submitFeedback: (feedbackData) => axiosClient.post('/feedback', feedbackData),
};
