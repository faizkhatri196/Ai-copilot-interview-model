import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to attach authentication token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          if (parsed && parsed.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
          }
        }
      } catch (e) {
        console.warn('Error reading auth token from storage:', e);
        localStorage.removeItem('userInfo');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle expired sessions and unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && path !== '/') {
          console.warn('Session expired or unauthorized. Redirecting to login.');
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
