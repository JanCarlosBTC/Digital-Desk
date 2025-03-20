/**
 * API Services - Legacy Implementation
 * 
 * DEPRECATED: This implementation is being phased out.
 * 
 * This is the original API service module that is being deprecated in favor of
 * the more robust api-service.ts implementation. This file is maintained for
 * backward compatibility with existing code that relies on it.
 * 
 * For new features, please use the implementations in api-service.ts instead,
 * which provides better error handling, authentication, and request management.
 * 
 * @deprecated Use api-service.ts for all new feature development
 */

import { Decision, Offer, Reflection, ClarityItem, ThinkingDeskItem } from '@/types';
import { useFeedback } from '@/lib/feedback';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const REQUEST_TIMEOUT = 10000; // 10 seconds

interface ApiError extends Error {
  status?: number;
  data?: any;
}

const apiRequest = async <T>(
  method: string,
  endpoint: string,
  data?: any
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error(errorData?.message || response.statusText) as ApiError;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout') as ApiError;
        timeoutError.status = 408;
        throw timeoutError;
      }
    }
    throw error;
  }
};

export const api = {
  decisions: {
    list: () => apiRequest<Decision[]>('GET', '/api/decisions'),
    create: (data: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiRequest<Decision>('POST', '/api/decisions', data),
    update: (id: string, data: Partial<Decision>) => 
      apiRequest<Decision>(`PUT`, `/api/decisions/${id}`, data),
    delete: (id: string) => 
      apiRequest<void>('DELETE', `/api/decisions/${id}`),
  },
  offers: {
    list: () => apiRequest<Offer[]>('GET', '/api/offers'),
    create: (data: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiRequest<Offer>('POST', '/api/offers', data),
    update: (id: string, data: Partial<Offer>) => 
      apiRequest<Offer>('PUT', `/api/offers/${id}`, data),
    delete: (id: string) => 
      apiRequest<void>('DELETE', `/api/offers/${id}`),
  },
  reflections: {
    list: () => apiRequest<Reflection[]>('GET', '/api/reflections'),
    create: (data: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiRequest<Reflection>('POST', '/api/reflections', data),
    update: (id: string, data: Partial<Reflection>) => 
      apiRequest<Reflection>('PUT', `/api/reflections/${id}`, data),
    delete: (id: string) => 
      apiRequest<void>('DELETE', `/api/reflections/${id}`),
  },
  clarity: {
    list: () => apiRequest<ClarityItem[]>('GET', '/api/clarity'),
    create: (data: Omit<ClarityItem, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiRequest<ClarityItem>('POST', '/api/clarity', data),
    update: (id: string, data: Partial<ClarityItem>) => 
      apiRequest<ClarityItem>('PUT', `/api/clarity/${id}`, data),
    delete: (id: string) => 
      apiRequest<void>('DELETE', `/api/clarity/${id}`),
  },
  thinkingDesk: {
    list: () => apiRequest<ThinkingDeskItem[]>('GET', '/api/thinking-desk'),
    create: (data: Omit<ThinkingDeskItem, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiRequest<ThinkingDeskItem>('POST', '/api/thinking-desk', data),
    update: (id: string, data: Partial<ThinkingDeskItem>) => 
      apiRequest<ThinkingDeskItem>('PUT', `/api/thinking-desk/${id}`, data),
    delete: (id: string) => 
      apiRequest<void>('DELETE', `/api/thinking-desk/${id}`),
  },
}; 