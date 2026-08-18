import axios from 'axios';

const getBaseURL = () => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL;
  if (!envUrl) return '/api';
  
  let trimmed = envUrl.trim().replace(/\/+$/, ''); // Remove trailing slashes
  if (!trimmed.endsWith('/api')) {
    trimmed += '/api';
  }
  return trimmed;
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true
});

// Request Interceptor — attach auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('gg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor — handle 401 with refresh token
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshEndpoint = `${getBaseURL()}/auth/refresh-token`;
        const res = await axios.post(refreshEndpoint, {}, { withCredentials: true });
        if (res.data.token) {
          localStorage.setItem('gg_token', res.data.token);
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          return API(originalRequest);
        }
      } catch (_err) {
        // Logout user — import lazily to avoid circular dep
        localStorage.removeItem('gg_token');
        localStorage.removeItem('gg_user');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
