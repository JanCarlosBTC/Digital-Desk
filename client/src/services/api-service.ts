
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add custom error handling if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors and unexpected server errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject(new Error('Network error occurred'));
    }
    return Promise.reject(error);
  }
);

export default api;
