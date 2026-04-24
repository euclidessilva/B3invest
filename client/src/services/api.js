import axios from 'axios';
import { supabase } from './supabase';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Stocks
export const getStocks = () => api.get('/api/stocks');
export const addStock = (payload) => api.post('/api/stocks', payload);
export const updateStock = (id, payload) => api.put(`/api/stocks/${id}`, payload);
export const deleteStock = (id) => api.delete(`/api/stocks/${id}`);
export const getPortfolio = (opts = {}) =>
  api.get('/api/stocks/portfolio', { params: opts.refresh ? { refresh: 'true' } : {} });
export const getSnapshots = (months = 12) =>
  api.get('/api/stocks/snapshots', { params: { months } });
export const getQuote = (ticker) => api.get(`/api/stocks/quote/${ticker}`);
export const searchTicker = (query) => api.get(`/api/stocks/search/${query}`);

// Dividends
export const getDividends = () => api.get('/api/dividends');
export const addDividend = (payload) => api.post('/api/dividends', payload);
export const getUpcomingDividends = () => api.get('/api/dividends/upcoming');

// Auth
export const validateInviteKey = (inviteKey) =>
  api.post('/api/auth/validate-invite', { inviteKey });
export const getMe = () => api.get('/api/auth/me');

// Admin
export const adminListUsers = () => api.get('/api/admin/users');
export const adminUpdatePassword = (id, password) =>
  api.patch(`/api/admin/users/${id}/password`, { password });
export const adminDeleteUser = (id) => api.delete(`/api/admin/users/${id}`);

export default api;
