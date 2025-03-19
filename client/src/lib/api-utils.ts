import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "./error-utils";

/**
 * Structured API error with additional metadata
 * Provides rich error context for better debugging and user feedback
 */
export interface ApiError extends Error {
  status?: number;
  data?: any;
  url?: string;
  method?: string;
  timestamp?: string;
  originalError?: unknown;
  requestData?: unknown;
}

/**
 * API request parameters with strict typing
 */
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
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
  method: string, 
  url: string, 
  data?: unknown, 
  options: { 
    headers?: Record<string, string>,
    timeout?: number
  } = {}
): Promise<T> {
  const startTime = performance.now();
  const { headers = {}, timeout = 30000 } = options;
  
  // Create abort controller for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    // Clear timeout since request completed
    clearTimeout(timeoutId);

    // Parse response data safely
    let responseData: any;
    try {
      // Try to parse as JSON first
      responseData = await response.json();
    } catch (parseError) {
      // If JSON parsing fails but response is OK, return empty object
      if (response.ok) {
        responseData = {};
      } else {
        // Otherwise try to get response text for better error context
        try {
          const text = await response.text();
          throw Object.assign(new Error(`Failed to parse response: ${(parseError as Error).message}`), {
            status: response.status,
            responseText: text,
            parseError
          });
        } catch (textError) {
          // If even text extraction fails, create minimal error
          throw Object.assign(new Error(`Request failed with status ${response.status}`), {
            status: response.status,
            parseError
          });
        }
      }
    }
    
    if (!response.ok) {
      // Create structured error with comprehensive metadata
      const errorMessage = 
        responseData?.message || 
        responseData?.error || 
        response.statusText || 
        'Unknown API Error';
        
      const apiError = new Error(`API Error: ${errorMessage}`) as ApiError;
      
      // Enhance error with metadata for better debugging
      apiError.status = response.status;
      apiError.data = responseData;
      apiError.url = url;
      apiError.method = method;
      apiError.timestamp = new Date().toISOString();
      apiError.requestData = data;
      
      throw apiError;
    }

    return responseData as T;
  } catch (error) {
    // Always clear timeout to prevent memory leaks
    clearTimeout(timeoutId);
    
    // Handle abort/timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeout}ms`) as ApiError;
      timeoutError.status = 408; // Request Timeout
      timeoutError.url = url;
      timeoutError.method = method;
      timeoutError.timestamp = new Date().toISOString();
      timeoutError.requestData = data;
      throw timeoutError;
    }
    
    // If error is already a structured API error, just rethrow it
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    
    // Otherwise, create a new structured error with available context
    const enhancedError = new Error(
      error instanceof Error 
        ? error.message 
        : 'Network or unexpected error'
    ) as ApiError;
    
    // Add metadata for better debugging
    enhancedError.originalError = error;
    enhancedError.url = url;
    enhancedError.method = method;
    enhancedError.timestamp = new Date().toISOString();
    enhancedError.requestData = data;
    
    throw enhancedError;
  } finally {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log long-running requests for performance monitoring
    if (duration > 1000) {
      console.warn(`Slow API request: ${method} ${url} took ${duration.toFixed(2)}ms`);
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
                timeout: req.timeout
              }
            )
          )
        ) as unknown as TData;
      } catch (error) {
        // Add batch context to error with improved type safety
        if (error instanceof Error) {
          const apiError = error as ApiError;
          apiError.data = {
            ...(apiError.data || {}),
            batchSize: requests.length,
            batchUrls: requests.map(r => r.url)
          };
        }
        throw error;
      }
    },
    onError: (error: Error) => {
      // Log structured error with batch context and better type safety
      const apiError = error as ApiError;
      console.error("Batch mutation error:", {
        message: error.message,
        status: apiError.status || 'unknown',
        data: apiError.data || {},
        timestamp: apiError.timestamp || new Date().toISOString()
      });
      
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
  method: ApiRequest['method'] = 'POST',
  options: {
    onSuccess?: (data: TData) => void;
    onError?: (error: ApiError) => void;
    invalidateQueries?: Array<string | { queryKey: string, exact?: boolean }>;
    headers?: Record<string, string>;
    timeout?: number;
  } = {}
) {
  const queryClient = useQueryClient();
  const { 
    onSuccess, 
    onError, 
    invalidateQueries, 
    headers, 
    timeout 
  } = options;

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      return await apiRequest<TData>(method, url, variables, { headers, timeout });
    },
    onSuccess: (data) => {
      // Execute success callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Invalidate relevant queries with improved type safety
      if (invalidateQueries && Array.isArray(invalidateQueries)) {
        invalidateQueries.forEach(queryKey => {
          if (typeof queryKey === 'string') {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          } else if (queryKey && typeof queryKey === 'object' && 'queryKey' in queryKey) {
            queryClient.invalidateQueries({ 
              queryKey: [queryKey.queryKey],
              exact: queryKey.exact 
            });
          }
        });
      }
    },
    onError: (error: Error) => {
      // Log structured error information with safer type checking
      const apiError = error as ApiError;
      console.error(`API Mutation error (${url}):`, {
        message: apiError.message,
        status: apiError.status || 'unknown',
        timestamp: apiError.timestamp || new Date().toISOString(),
        data: apiError.data || {}
      });
      
      // Execute error callback if provided with proper type handling
      if (onError) {
        if ('status' in error) {
          onError(error as ApiError);
        } else {
          // Create minimal ApiError if the error isn't already one
          const enhancedError = new Error(error.message) as ApiError;
          enhancedError.originalError = error;
          enhancedError.url = url;
          enhancedError.method = method;
          enhancedError.timestamp = new Date().toISOString();
          onError(enhancedError);
        }
      }
      
      // Forward to global error handler
      handleApiError(error);
    }
  });
} 