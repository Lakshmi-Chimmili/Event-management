import axiosClient from './axiosClient';

export const checklistApi = {
  getChecklist: (eventId) => axiosClient.get(`/events/${eventId}/checklist`),
  addTask: (eventId, taskData) => axiosClient.post(`/events/${eventId}/checklist`, taskData),
  toggleTask: (taskId) => axiosClient.put(`/checklist/${taskId}/toggle`),
  deleteTask: (taskId) => axiosClient.delete(`/checklist/${taskId}`),
};
