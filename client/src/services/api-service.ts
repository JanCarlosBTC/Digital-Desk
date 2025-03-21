/**
 * API Services - Current Implementation
 * 
 * This is the active API service module used across the application.
 * It provides robust request handling with features like:
 * - Automatic authentication token management
 * - Retry logic for network failures
 * - Error handling and user feedback
 * - Rate limiting protection
 * 
 * NOTE: There is a legacy api.ts file that is being deprecated.
 * All new code should use this implementation.
 */

import { authService } from './auth-service';
import { toast } from '@/hooks/use-toast';

// Base API URL 
const API_BASE_URL = '/api';

// Default request options
const DEFAULT_OPTIONS: RequestInit = {
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
};

// Maximum retry attempts for recoverable errors
const MAX_RETRIES = 3;

// Delay between retry attempts (with exponential backoff)
const RETRY_DELAY = 1000;

/**
 * Error class for API responses
 */
export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Handle API response and extract data or throw error
 */
async function handleResponse(response: Response) {
  // For 204 No Content responses, return null
  if (response.status === 204) {
    return null;
  }
  
  let data;
  try {
    // Try to parse JSON response
    data = await response.json();
  } catch (error) {
    // If JSON parsing fails, use text content
    data = { message: await response.text() };
  }
  
  // If response is not ok, throw error
  if (!response.ok) {
    // Handle specific error cases
    if (response.status === 401) {
      // Token expired or invalid, log details and trigger logout
      console.error('Authentication error:', data);
      console.log('Current token:', authService.getToken() ? 'Token exists' : 'No token');
      
      // Show more detailed error message
      toast({
        title: 'Authentication Error',
        description: data.message || 'Your session has expired. Please log in again.',
        variant: 'destructive'
      });
      
      // Clear token and trigger logout
      authService.clearToken();
    } else if (response.status === 429) {
      // Rate limit exceeded
      toast({
        title: 'Rate Limit Exceeded',
        description: data.message || 'Too many requests. Please try again later.',
        variant: 'destructive'
      });
    }
    
    throw new ApiError(
      response.status,
      data.message || 'An error occurred',
      data
    );
  }
  
  return data;
}

/**
 * Retry a request with exponential backoff
 */
async function retryRequest(
  url: string, 
  options: RequestInit, 
  retriesLeft: number, 
  lastError: Error
): Promise<any> {
  if (retriesLeft <= 0) {
    throw lastError;
  }
  
  // Add exponential backoff with jitter
  const delay = RETRY_DELAY * Math.pow(2, MAX_RETRIES - retriesLeft) * (0.5 + Math.random() * 0.5);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  try {
    return await performRequest(url, options, retriesLeft - 1);
  } catch (error) {
    return retryRequest(url, options, retriesLeft - 1, error as Error);
  }
}

/**
 * Perform the actual request with retry logic
 */
async function performRequest(
  url: string, 
  options: RequestInit, 
  retriesLeft: number = MAX_RETRIES
): Promise<any> {
  try {
    // Add auth token if available
    const token = authService.getToken();
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    const response = await fetch(url, options);
    
    // Don't retry on client errors except for specific cases
    if (response.status >= 400 && response.status < 500) {
      // Retry on rate limiting (429) and gateway timeout (504)
      if (response.status !== 429 && response.status !== 504) {
        return handleResponse(response);
      }
    }
    
    // Handle successful responses
    return await handleResponse(response);
  } catch (error) {
    // Only retry on network errors or rate limit exceeded
    if (error instanceof ApiError) {
      if (error.status !== 429 && error.status !== 504) {
        throw error;
      }
    }
    
    if (retriesLeft <= 0) {
      throw error;
    }
    
    return retryRequest(url, options, retriesLeft - 1, error as Error);
  }
}

/**
 * Main API client for making requests
 */
export const apiClient = {
  /**
   * Send a GET request
   */
  async get(endpoint: string, params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    return performRequest(url, {
      ...DEFAULT_OPTIONS,
      method: 'GET'
    });
  },
  
  /**
   * Send a POST request
   */
  async post(endpoint: string, data = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    return performRequest(url, {
      ...DEFAULT_OPTIONS,
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  /**
   * Send a PUT request
   */
  async put(endpoint: string, data = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    return performRequest(url, {
      ...DEFAULT_OPTIONS,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  /**
   * Send a DELETE request
   */
  async delete(endpoint: string) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    return performRequest(url, {
      ...DEFAULT_OPTIONS,
      method: 'DELETE'
    });
  }
};

// Specialized API services
// We'll extend these with more specific endpoints as needed

/**
 * Auth API service
 */
export const authApi = {
  register(userData: any) {
    return apiClient.post('/api/auth/register', userData);
  },
  
  login(credentials: any) {
    return apiClient.post('/api/auth/login', credentials);
  },
  
  devLogin(username: string) {
    return apiClient.post('/api/auth/dev-login', { username });
  },
  
  getProfile() {
    return apiClient.get('/api/user/profile');
  },
  
  updateProfile(userData: any) {
    return apiClient.put('/api/user/profile', userData);
  }
};

/**
 * Subscription API service
 */
export const subscriptionApi = {
  createCheckoutSession(plan: string) {
    return apiClient.post('/api/subscriptions/create-checkout', { plan });
  }
}; 