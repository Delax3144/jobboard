import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(response => response, (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const token = localStorage.getItem('token');
    if (error.response?.status === 401 && token &&
        error.config?.headers?.Authorization === `Bearer ${token}` &&
        !['/auth/login', '/auth/verify-2fa-login', '/auth/2fa/disable'].includes(error.config?.url ?? '')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth_expired'));
    }
  }
  return Promise.reject(error);
});

export default api;
