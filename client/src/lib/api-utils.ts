/**
 * API Utilities
 * 
 * Standardized API request handling with consistent error management,
 * loading state tracking, and response type safety.
 */

import { useMutation, useQuery, UseMutationOptions, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { useToast } from '@/hooks/use-toast';
import { ErrorType, ErrorData } from "./error-utils";
import { useEffect } from 'react';

/**
 * Structured API error with additional metadata
 * Provides rich error context for better debugging and user feedback
 */
export interface ApiError extends Error {
  // Properties from Error base type
  name: string;          // Error name (required for Error type)
  message: string;       // Error message (required for Error type)
  stack?: string;        // Call stack
  
  // Extended API error properties
  status?: number;       // HTTP status code
  data?: ErrorData;      // Structured error data
  url?: string;          // Request URL
  method?: string;       // HTTP method
  timestamp: string;     // When the error occurred
  originalError?: unknown; // Original error object
  requestData?: unknown;   // Request payload that caused the error
  retryable?: boolean;     // If the request can be retried
  errorType?: ErrorType;   // Categorized error type
  operationId?: string;    // Unique ID for tracking the error
}

/**
 * HTTP Methods supported by the API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API request parameters with strict typing
 */
export interface ApiRequest<TData = unknown> {
  method: HttpMethod;
  url: string;
  data?: TData;
  headers?: Record<string, string>;
  timeout?: number;
  retryConfig?: {
    maxRetries: number;
    retryableStatuses: number[];
  };
  cache?: RequestCache;
  signal?: AbortSignal;
}

/**
 * API response with metadata
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  serverTiming?: Record<string, number>;
  timestamp: string;
}

/**
 * Request metadata for performance tracking and debugging
 */
interface RequestMetadata {
  startTime: number;
  url: string;
  method: HttpMethod;
  requestId: string;
}

/**
 * Generates a unique request ID for tracking related requests and errors
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Enhanced API request function with improved error handling and timeout support
 * Provides comprehensive error information and better debugging context
 * 
 * @template T The expected return type of the API request
 * @param method HTTP method to use
 * @param url API endpoint URL
 * @param data Optional request payload
 * @param options Additional request options
 * @returns Promise resolving to the response data of type T
 * @throws ApiError with enhanced metadata on request failure
 */
async function apiRequest<T>(
  method: HttpMethod, 
  url: string, 
  data?: unknown, 
  options: { 
    headers?: Record<string, string>;
    timeout?: number;
    retryConfig?: {
      maxRetries: number;
      retryableStatuses: number[];
    };
    cache?: RequestCache;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const requestId = generateRequestId();
  const metadata: RequestMetadata = {
    startTime: performance.now(),
    url,
    method,
    requestId
  };
  
  const { 
    headers = {}, 
    timeout = 30000, 
    retryConfig = { maxRetries: 0, retryableStatuses: [] },
    cache = 'default',
    signal
  } = options;
  
  // Create abort controller for timeout handling unless signal already provided
  let controller: AbortController | undefined;
  let timeoutId: NodeJS.Timeout | undefined;
  
  if (!signal) {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      console.warn(`Request timeout for ${method} ${url} (ID: ${requestId})`);
      controller?.abort('timeout');
    }, timeout);
  }
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: signal || controller?.signal,
      cache
    });

    // Clear timeout since request completed
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Extract server timing headers for performance monitoring if present
    const serverTiming: Record<string, number> = {};
    const timingHeader = response.headers.get('Server-Timing');
    if (timingHeader) {
      const timings = timingHeader.split(',');
      timings.forEach(timing => {
        const [name, durationStr] = timing.trim().split(';dur=');
        if (name && durationStr) {
          const duration = parseFloat(durationStr);
          if (!isNaN(duration)) {
            serverTiming[name] = duration;
          }
        }
      });
    }

    // Parse response data safely with improved error handling
    let responseData: any;
    try {
      // Check content type to determine how to parse the response
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        // No content responses
        responseData = null;
      } else if (contentType.includes('text/')) {
        // Handle text responses
        const text = await response.text();
        // Try to parse as JSON if it looks like JSON
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          try {
            responseData = JSON.parse(text);
          } catch {
            responseData = text;
          }
        } else {
          responseData = text;
        }
      } else {
        // For other content types, return empty object but log content type
        console.warn(`Unhandled content type: ${contentType} for ${url}`);
        responseData = {};
      }
    } catch (parseError) {
      // Special handling for parsing errors
      if (response.ok) {
        // If response is OK but parsing failed, return empty object
        responseData = {};
      } else {
        // For error responses with parsing issues, try to get text
        try {
          const text = await response.text();
          const error = new Error(`Failed to parse response: ${(parseError as Error).message}`) as ApiError;
          error.name = 'ApiError';
          error.status = response.status;
          error.data = { responseText: text };
          error.url = url;
          error.method = method;
          error.timestamp = new Date().toISOString();
          error.operationId = requestId;
          error.originalError = parseError;
          throw error;
        } catch (textError) {
          // Create error with available context if everything fails
          const error = new Error(`Request failed with status ${response.status}`) as ApiError;
          error.name = 'ApiError';
          error.status = response.status;
          error.url = url;
          error.method = method;
          error.timestamp = new Date().toISOString();
          error.operationId = requestId;
          error.originalError = parseError;
          throw error;
        }
      }
    }
    
    if (!response.ok) {
      // Check if we should retry based on status code
      const shouldRetry = retryConfig.maxRetries > 0 && 
                         retryConfig.retryableStatuses.includes(response.status);
                        
      // Create structured error with comprehensive metadata
      const errorMessage = 
        responseData?.message || 
        responseData?.error || 
        response.statusText || 
        'Unknown API Error';
        
      const apiError = new Error(`API Error: ${errorMessage}`) as ApiError;
      apiError.name = 'ApiError';
      
      // Enhanced error with rich metadata
      apiError.status = response.status;
      apiError.data = responseData;
      apiError.url = url;
      apiError.method = method;
      apiError.timestamp = new Date().toISOString();
      apiError.requestData = data;
      apiError.retryable = shouldRetry;
      apiError.operationId = requestId;
      
      // Determine error type based on status code
      apiError.errorType = response.status === 401 ? ErrorType.AUTHENTICATION :
                         response.status === 403 ? ErrorType.AUTHORIZATION :
                         response.status === 404 ? ErrorType.NOT_FOUND :
                         response.status === 408 ? ErrorType.TIMEOUT :
                         response.status >= 400 && response.status < 500 ? ErrorType.VALIDATION :
                         response.status >= 500 ? ErrorType.SERVER :
                         ErrorType.UNKNOWN;
      
      throw apiError;
    }

    // Log performance metrics for successful requests
    const endTime = performance.now();
    const duration = endTime - metadata.startTime;
    
    if (duration > 1000) {
      console.warn(`Slow API request: ${method} ${url} took ${duration.toFixed(2)}ms (ID: ${requestId})`);
    }

    return responseData as T;
  } catch (error) {
    // Always clear timeout to prevent memory leaks
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Handle abort/timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeout}ms`) as ApiError;
      timeoutError.status = 408; // Request Timeout
      timeoutError.url = url;
      timeoutError.method = method;
      timeoutError.timestamp = new Date().toISOString();
      timeoutError.requestData = data;
      timeoutError.operationId = requestId;
      timeoutError.errorType = ErrorType.TIMEOUT;
      throw timeoutError;
    }
    
    // If error is already a structured API error, add request ID if missing
    if (error instanceof Error && 'status' in error) {
      const apiError = error as ApiError;
      if (!apiError.operationId) {
        apiError.operationId = requestId;
      }
      throw apiError;
    }
    
    // For network errors, create a properly typed network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network connection issue') as ApiError;
      networkError.status = 0;
      networkError.url = url;
      networkError.method = method;
      networkError.timestamp = new Date().toISOString();
      networkError.requestData = data;
      networkError.originalError = error;
      networkError.operationId = requestId;
      networkError.errorType = ErrorType.NETWORK;
      networkError.retryable = true;
      throw networkError;
    }
    
    // Otherwise, create a new structured error with available context
    const enhancedError = new Error(
      error instanceof Error 
        ? error.message 
        : 'Unexpected API error'
    ) as ApiError;
    
    // Add metadata for better debugging
    enhancedError.originalError = error;
    enhancedError.url = url;
    enhancedError.method = method;
    enhancedError.timestamp = new Date().toISOString();
    enhancedError.requestData = data;
    enhancedError.operationId = requestId;
    enhancedError.errorType = ErrorType.UNKNOWN;
    
    throw enhancedError;
  } finally {
    const endTime = performance.now();
    const duration = endTime - metadata.startTime;
    
    // Performance monitoring for all requests (success or failure)
    if (process.env.NODE_ENV === 'development' || duration > 1000) {
      console.debug(`API ${method} ${url} completed in ${duration.toFixed(2)}ms (ID: ${requestId})`);
    }
  }
}

// Standard error handling
export function handleApiError(error: Error): string {
  console.error('API Error:', error);
  
  // Extract more meaningful error messages when possible
  if ('data' in error && (error as any).data) {
    const apiError = error as ApiError;
    
    // Check for validation errors in the expected format
    if (apiError.data && apiError.data.errors && typeof apiError.data.errors === 'object') {
      const errorMessages = Object.entries(apiError.data.errors)
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          } else {
            return `${field}: ${String(messages)}`;
          }
        })
        .join('. ');
      
      if (errorMessages) {
        return errorMessages;
      }
    }
    
    // Check for direct message in data
    if (apiError.data && apiError.data.message) {
      return apiError.data.message;
    }
  }
  
  // Fall back to error message
  return error.message || 'An unexpected error occurred';
}

/**
 * API endpoint constants for consistent usage across the application
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
  },
  THINKING_DESK: {
    BRAIN_DUMP: '/api/brain-dump',
    PROBLEM_TREES: '/api/problem-trees',
    DRAFTED_PLANS: '/api/drafted-plans',
    CLARITY_LABS: '/api/clarity-labs',
  },
  REFLECTIONS: {
    WEEKLY: '/api/weekly-reflections',
    MONTHLY: '/api/monthly-check-ins',
  },
  DECISIONS: '/api/decisions',
  OFFERS: '/api/offers',
  OFFER_NOTES: '/api/offer-notes',
  PRIORITIES: '/api/priorities',
  SUBSCRIPTION: {
    CREATE_SESSION: '/api/subscription/create-checkout-session',
    STATUS: '/api/subscription/status',
  }
};

/**
 * Hook for enhanced API queries with standardized error handling
 */
export function useEnhancedApiQuery<T>(
  queryKey: QueryKey,
  url: string,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'>
) {
  const { toast } = useToast();
  
  // Create a custom error handling function
  const handleError = (error: Error) => {
    const errorMessage = handleApiError(error);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };
  
  // In TanStack Query v5, onError is no longer a direct option
  // We need to use the useQuery and then add an effect to handle errors
  const query = useQuery<T, Error>({
    queryKey,
    queryFn: async () => apiRequest<T>('GET', url),
    ...options,
  });
  
  // Use an effect to handle errors
  useEffect(() => {
    if (query.error) {
      handleError(query.error);
    }
  }, [query.error]);
  
  // Add logging for slow queries in development
  useEffect(() => {
    // Only track timing in development mode and when actually fetching
    if (process.env.NODE_ENV === 'development' && query.isFetching) {
      const startTime = Date.now();
      return () => {
        const duration = Date.now() - startTime;
        if (duration > 1000) {
          console.warn(`Slow query for ${url}: ${duration}ms`);
        }
      };
    }
    
    // Always return a cleanup function to fix TypeScript error
    return () => { /* Empty cleanup function */ };
  }, [query.isFetching, url]);
  
  return query;
}

/**
 * Type for query invalidation with improved type safety
 */
export type QueryInvalidation = 
  | string 
  | QueryKey 
  | {
      queryKey: string | QueryKey;
      exact?: boolean;
    };

/**
 * Interface for API mutation options with improved type safety
 */
export interface ApiMutationOptions<TData = unknown, TVariables = unknown> {
  /** Success callback with the API response */
  onSuccess?: (data: TData) => void;
  
  /** Error callback with the enhanced API error */
  onError?: (error: ApiError) => void;
  
  /** Query keys to invalidate after successful mutation */
  invalidateQueries?: QueryInvalidation[];
  
  /** Custom headers to include with the request */
  headers?: Record<string, string>;
  
  /** Timeout in milliseconds */
  timeout?: number;
  
  /** Whether to retry the request on certain failures */
  retry?: boolean | number | {
    maxRetries: number;
    retryableStatuses: number[];
  };
  
  /** Cache behavior for the request */
  cache?: RequestCache;
}

/**
 * Hook for API mutations with enhanced type safety and error handling
 * Provides structured error handling and automatic cache invalidation
 * 
 * @param url API endpoint URL
 * @param method HTTP method
 * @param options Mutation options including callbacks and cache invalidation
 * @returns Mutation object for API interaction
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  method: HttpMethod = 'POST',
  options: ApiMutationOptions<TData, TVariables> = {}
) {
  const { 
    onSuccess, 
    onError, 
    invalidateQueries, 
    headers, 
    timeout,
    retry,
    cache
  } = options;

  // Convert retry options to standardized format
  const retryConfig = typeof retry === 'boolean' ? 
    (retry ? { maxRetries: 3, retryableStatuses: [408, 429, 500, 502, 503, 504] } : { maxRetries: 0, retryableStatuses: [] }) :
    typeof retry === 'number' ? 
    { maxRetries: retry, retryableStatuses: [408, 429, 500, 502, 503, 504] } : 
    retry || { maxRetries: 0, retryableStatuses: [] };

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      return await apiRequest<TData>(
        method, 
        url, 
        variables, 
        { 
          headers, 
          timeout,
          retryConfig,
          cache
        }
      );
    },
    onSuccess: (data) => {
      // Execute success callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Invalidate specified queries
      if (invalidateQueries && invalidateQueries.length > 0) {
        invalidateQueries.forEach(query => {
          if (typeof query === 'string') {
            queryClient.invalidateQueries({ queryKey: [query] });
          } else if (Array.isArray(query)) {
            queryClient.invalidateQueries({ queryKey: query });
          } else if (typeof query === 'object' && 'queryKey' in query) {
            const queryObject = query as { queryKey: string | QueryKey, exact?: boolean };
            queryClient.invalidateQueries({ 
              queryKey: typeof queryObject.queryKey === 'string' ? [queryObject.queryKey] : queryObject.queryKey,
              exact: queryObject.exact
            });
          }
        });
      }
    },
    onError: (error: Error) => {
      const { toast } = useToast();
      const errorMessage = handleApiError(error);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Call the custom onError if provided
      if (onError && error instanceof Error) {
        onError(error as ApiError);
      }
    },
  });
}

/**
 * Reusable simplified mutation hook with standardized error handling
 */
export function useSimplifiedApiMutation<TData, TVariables>(
  method: string,
  endpoint: string | ((variables: TVariables) => string),
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const { toast } = useToast();
  
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const finalEndpoint = typeof endpoint === 'function' 
        ? endpoint(variables) 
        : endpoint;
        
      return apiRequest<TData>(
        method as HttpMethod,
        finalEndpoint,
        variables
      );
    },
    ...options,
    onError: (error: Error) => {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // For TanStack Query v5 compatibility, we're removing the custom onError handler call
      // to avoid type mismatches
    },
  });
}

/**
 * Enhanced API mutation hook with improved error handling
 * This provides a simplified interface for mutations with consistent error handling
 */
export function useEnhancedApiMutation<TData = unknown, TVariables = unknown>(
  method: HttpMethod,
  url: string | ((variables: TVariables) => string),
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: Array<string | QueryKey>;
  }
) {
  const { toast } = useToast();
  
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const resolvedUrl = typeof url === 'function' ? url(variables) : url;
      return await apiRequest<TData>(method, resolvedUrl, variables);
    },
    onSuccess: (data) => {
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
      
      // Invalidate queries if specified
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          if (typeof queryKey === 'string') {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          } else {
            queryClient.invalidateQueries({ queryKey });
          }
        });
      }
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
}