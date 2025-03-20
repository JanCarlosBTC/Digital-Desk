/**
 * API Utilities
 * 
 * Standardized API request handling with consistent error management,
 * loading state tracking, and response type safety.
 */

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient, QueryKey, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { queryClient } from './queryClient';
import { ErrorType, ErrorData, EnhancedError } from "./error-utils";

/**
 * Structured API error with additional metadata
 * Provides rich error context for better debugging and user feedback
 */
export interface ApiError extends Error {
  status?: number;
  data?: ErrorData;
  url?: string;
  method?: string;
  timestamp: string;
  originalError?: unknown;
  requestData?: unknown;
  retryable?: boolean;
  errorType?: ErrorType;
  operationId?: string;
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
          throw Object.assign(new Error(`Failed to parse response: ${(parseError as Error).message}`), {
            status: response.status,
            responseText: text,
            parseError,
            url,
            method,
            timestamp: new Date().toISOString(),
            operationId: requestId
          });
        } catch (textError) {
          // Create error with available context if everything fails
          throw Object.assign(new Error(`Request failed with status ${response.status}`), {
            status: response.status,
            parseError,
            url,
            method,
            timestamp: new Date().toISOString(),
            operationId: requestId
          });
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

/**
 * Hook for batch mutations (multiple API requests in a single operation)
 * Provides optimized execution with consistent error handling
 * 
 * @template TData The return type of the mutation (defaults to unknown[])
 * @returns Mutation object for executing multiple requests together
 */
export function useBatchMutation<TData = unknown[]>() {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, ApiRequest[]>({
    mutationFn: async (requests: ApiRequest[]) => {
      const batchId = generateRequestId();
      
      try {
        // Type assertion to allow returning the Promise.all result
        return await Promise.all(
          requests.map(req => 
            apiRequest(
              req.method, 
              req.url, 
              req.data, 
              { 
                headers: req.headers,
                timeout: req.timeout,
                retryConfig: req.retryConfig,
                cache: req.cache,
                signal: req.signal
              }
            )
          )
        ) as unknown as TData;
      } catch (error) {
        // Add batch context to error with improved type safety
        if (error instanceof Error) {
          const apiError = error as ApiError;
          
          // Create properly structured error data
          const errorData: ErrorData = {
            ...(typeof apiError.data === 'object' ? apiError.data as object : {}),
            batchId,
            batchSize: requests.length,
            batchUrls: requests.map(r => r.url),
            failedRequestIndex: requests.findIndex(req => 
              req.url === apiError.url && req.method === apiError.method
            )
          };
          
          apiError.data = errorData;
        }
        throw error;
      }
    },
    onError: (error: Error) => {
      // More structured error logging with better type safety
      if (error instanceof Error) {
        const apiError = error as ApiError;
        
        console.error("Batch mutation error:", {
          operationId: apiError.operationId || 'unknown',
          message: error.message,
          errorType: apiError.errorType || 'unknown',
          status: apiError.status || 'unknown',
          url: apiError.url || 'unknown',
          method: apiError.method || 'unknown',
          timestamp: apiError.timestamp || new Date().toISOString(),
          data: apiError.data || {}
        });
      }
      
      // Forward to global error handler
      handleApiError(error);
    },
    onSettled: () => {
      // Invalidate affected queries - consider using more targeted invalidation
      queryClient.invalidateQueries();
    },
  });
}

/**
 * Interface for API mutation options with improved type safety
 */
export interface ApiMutationOptions<TData = unknown, TVariables = unknown> {
  /** Success callback with the API response */
  onSuccess?: (data: TData) => void;

  /** Error callback with the enhanced API error */
  onError?: (error: ApiError) => void;

  /** Query keys to invalidate after successful mutation */
  invalidateQueries?: Array<string | QueryKey | { queryKey: string | QueryKey, exact?: boolean }>;

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { 
    onSuccess, 
    onError, 
    invalidateQueries, 
    headers, 
    timeout,
    retry,
    cache
  } = options;

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
      if (onSuccess) {
        onSuccess(data);
      }

      if (invalidateQueries && Array.isArray(invalidateQueries)) {
        invalidateQueries.forEach(queryKey => {
          if (typeof queryKey === 'string') {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          } else if (Array.isArray(queryKey)) {
            queryClient.invalidateQueries({ queryKey });
          } else if (queryKey && typeof queryKey === 'object' && 'queryKey' in queryKey) {
            const key = queryKey.queryKey;
            queryClient.invalidateQueries({ 
              queryKey: typeof key === 'string' ? [key] : key,
              exact: queryKey.exact 
            });
          }
        });
      }
    },
    onError: (error: Error) => {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      if (onError) {
        onError(error as ApiError);
      }
    },
  });
}

// API endpoint constants to avoid string literals
export const API_ENDPOINTS = {
  DECISIONS: '/api/decisions',
  DECISION: (id: number) => `/api/decisions/${id}`,
  OFFERS: '/api/offers',
  OFFER: (id: number) => `/api/offers/${id}`,
  DRAFTED_PLANS: '/api/drafted-plans',
  DRAFTED_PLAN: (id: number) => `/api/drafted-plans/${id}`,
};

// Standard error handling
export function handleApiError(error: Error): string {
  console.error('API Error:', error);

  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (error.message.includes('404')) {
    return 'The requested resource was not found.';
  }

  if (error.message.includes('401')) {
    return 'You are not authorized to perform this action. Please log in again.';
  }

  if (error.message.includes('403')) {
    return 'You do not have permission to access this resource.';
  }

  return error.message || 'An unexpected error occurred. Please try again.';
}

// Enhanced query hook with better error handling
export function useEnhancedApiQuery<T>(
  endpoint: string,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey'> & { 
    onCustomError?: (error: Error) => void 
  }
) {
  const { toast } = useToast();
  
  // Create the query options without onCustomError
  const { onCustomError, ...restOptions } = options || {};
  
  const result = useQuery<T>({
    queryKey: [endpoint],
    ...restOptions
  });
  
  // Handle errors with effect
  useEffect(() => {
    if (result.error) {
      const errorMessage = handleApiError(result.error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Call the custom error handler if provided
      if (onCustomError) {
        onCustomError(result.error);
      }
    }
  }, [result.error, toast, onCustomError]);
  
  return result;
}

// Enhanced mutation hook with better type safety
export function useEnhancedApiMutation<TData, TVariables>(
  method: HttpMethod,
  endpoint: string | ((variables: TVariables) => string),
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const { toast } = useToast();
  
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const finalEndpoint = typeof endpoint === 'function' 
        ? endpoint(variables) 
        : endpoint;
        
      return apiRequest<TData>(
        method,
        finalEndpoint,
        variables
      );
    },
    ...options,
    onError: (error: Error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Call the custom onError if provided
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
  });
}


// Reusable query hook with standardized error handling
export function useApiQuery<T>(
  endpoint: string,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey'> & { 
    onCustomError?: (error: Error) => void 
  }
) {
  const { toast } = useToast();
  
  // Create the query options without onCustomError
  const { onCustomError, ...restOptions } = options || {};
  
  const result = useQuery<T>({
    queryKey: [endpoint],
    ...restOptions
  });
  
  // Handle errors with effect
  useEffect(() => {
    if (result.error) {
      const errorMessage = handleApiError(result.error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Call the custom error handler if provided
      if (onCustomError) {
        onCustomError(result.error);
      }
    }
  }, [result.error, toast, onCustomError]);
  
  return result;
}

// This implementation has been removed to avoid duplicate exports.
// The first implementation at line ~462 is being used instead.

export type RequestCache = 'default' | 'no-cache' | 'reload' | 'force-cache' | 'only-if-cached';