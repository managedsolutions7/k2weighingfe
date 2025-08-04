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
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
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
        localStorage.clear(); // Clear local storage
        window.location.href = '/login'; // Redirect to login page
      }
      // You can also show a toast, log, etc.
    }
    return Promise.reject(error);
  },
);

export default api;
