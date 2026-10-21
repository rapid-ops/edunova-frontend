import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api',
});

const OPEN = ['/auth/login', '/auth/google', '/mfa/verify-login', '/mfa/backup-code', '/auth/forgot-password', '/auth/reset-password'];

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('session_only') === '1' && !sessionStorage.getItem('session_alive')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('session_only');
    }
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = String(err.config?.url || '');
    if (err.response?.status === 429) {
      const msg = 'Too many requests, please try again shortly';
      err.userMessage = msg;
      const d = err.response.data;
      if (d && typeof d === 'object') { if (!d.error) d.error = msg; } else { err.response.data = { error: msg }; }
      return Promise.reject(err);
    }
    if (err.response?.status === 401 && typeof window !== 'undefined' && !OPEN.some((p) => url.includes(p))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;
