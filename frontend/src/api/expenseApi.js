import axiosClient from './axiosClient';

export const expenseApi = {
  getExpensesByEvent: (eventId, params) => axiosClient.get(`/events/${eventId}/expenses`, { params }),
  addExpense: (eventId, expenseData) => axiosClient.post(`/events/${eventId}/expenses`, expenseData),
  updateExpense: (expenseId, expenseData) => axiosClient.put(`/expenses/${expenseId}`, expenseData),
  deleteExpense: (expenseId) => axiosClient.delete(`/expenses/${expenseId}`),
  getBudgetSummary: (eventId) => axiosClient.get(`/events/${eventId}/budget-summary`),
};
