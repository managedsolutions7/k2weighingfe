import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
// Create the instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Or hardcode your baseURL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Example: attach auth token if it exists
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Allow server-driven caching; do not force no-cache from frontend
    return config;
  },
  (error: AxiosError) => {
    // Optionally log request errors here
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response, // Pass through successful responses directly
  (error: AxiosError) => {
    // Handle errors globally
    if (error.response) {
      // Example: handle unauthorized errors
      if (error.response.status === 401) {
        // e.g., redirect to login, clear user data, show message, etc.
        if (typeof localStorage !== 'undefined') localStorage.clear();
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
      // You can also show a toast, log, etc.
    }
    return Promise.reject(error);
  },
);

export default api;

// Helper to unwrap API wrapper { success, data, message }
export const unwrap = async <T>(promise: Promise<import('axios').AxiosResponse>): Promise<T> => {
  const res = await promise;
  const cfg = res.config as { responseType?: string };
  const payload = res.data as unknown as { success?: boolean; data?: unknown; message?: string };
  if (cfg?.responseType === 'blob') {
    return res.data as T; // passthrough for binary
  }
  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (payload.success) return (payload.data as T) ?? (undefined as unknown as T);
    throw new Error(payload.message || 'Request failed');
  }
  // Fallback: return raw data if wrapper absent
  return res.data as T;
};
