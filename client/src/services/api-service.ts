
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

export const subscriptionApi = {
  createCheckoutSession: async (plan: string) => {
    const response = await api.post('/subscription/create-checkout-session', { plan });
    return response.data;
  }
};

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
