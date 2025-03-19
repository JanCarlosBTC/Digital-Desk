import { useToast } from "@/components/ui/use-toast";
import { useCallback, useState, useEffect } from "react";
import { ApiError } from "./api-utils";

/**
 * Error types for better error classification and handling
 */
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

/**
 * Enhanced error interface with more metadata for debugging and user feedback
 */
export interface EnhancedError extends Error {
  type: ErrorType;
  status?: number;
  data?: any;
  url?: string;
  method?: string;
  timestamp?: string;
  recoverable?: boolean;
  retryCount?: number;
  recoverySuggestion?: string;
  originalError?: unknown;
  requestData?: unknown;
}

/**
 * Maps HTTP status codes to error types for consistent error classification
 * 
 * @param status HTTP status code
 * @returns ErrorType classification
 */
export function getErrorTypeFromStatus(status?: number): ErrorType {
  if (!status) return ErrorType.UNKNOWN;
  
  if (status === 401) return ErrorType.AUTHENTICATION;
  if (status === 403) return ErrorType.AUTHORIZATION;
  if (status === 404) return ErrorType.NOT_FOUND;
  if (status === 408) return ErrorType.TIMEOUT;
  if (status >= 400 && status < 500) return ErrorType.VALIDATION;
  if (status >= 500) return ErrorType.SERVER;
  
  return ErrorType.UNKNOWN;
}

/**
 * Determines if an error is user-recoverable
 * Some errors can be fixed by user action, while others require system intervention
 * 
 * @param errorType Type of error
 * @returns Boolean indicating whether error is recoverable by user action
 */
export function isRecoverableError(errorType: ErrorType): boolean {
  switch (errorType) {
    case ErrorType.NETWORK:
    case ErrorType.TIMEOUT:
    case ErrorType.AUTHENTICATION:
      return true;
    case ErrorType.VALIDATION:
      return true;
    case ErrorType.SERVER:
    case ErrorType.UNKNOWN:
      return false;
    default:
      return false;
  }
}

/**
 * Provides a user-friendly recovery suggestion based on error type
 * 
 * @param errorType Type of error
 * @returns String with recovery suggestion
 */
export function getRecoverySuggestion(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Please check your internet connection and try again.';
    case ErrorType.TIMEOUT:
      return 'The server is taking too long to respond. Please try again later.';
    case ErrorType.AUTHENTICATION:
      return 'Your session may have expired. Please sign in again.';
    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to access this resource.';
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource could not be found.';
    case ErrorType.SERVER:
      return 'There was a problem with the server. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Extracts a human-readable error message from various error types
 * Enhanced with smarter message extraction and fallbacks
 * 
 * @param error Any error object, string or unknown value
 * @returns User-friendly error message
 */
export function extractErrorMessage(error: unknown): string {
  // Handle structured API errors
  if (error instanceof Error && ('status' in error || 'type' in error)) {
    // Use our enhanced error interface
    const enhancedError = error as EnhancedError;
    
    // If it's already properly typed, use predefined messages
    if (enhancedError.type) {
      if (enhancedError.recoverySuggestion) {
        return enhancedError.recoverySuggestion;
      }
      return getRecoverySuggestion(enhancedError.type);
    }
    
    // If it has status but no type, derive type from status
    if (enhancedError.status !== undefined) {
      const errorType = getErrorTypeFromStatus(enhancedError.status);
      return getRecoverySuggestion(errorType);
    }
    
    // Extract structured error data if available
    if (enhancedError.data) {
      if (typeof enhancedError.data === 'object' && enhancedError.data !== null) {
        // Handle common API error response formats
        if (enhancedError.data.message) {
          return String(enhancedError.data.message);
        }
        if (enhancedError.data.error) {
          return String(enhancedError.data.error);
        }
        if (enhancedError.data.errors && Array.isArray(enhancedError.data.errors)) {
          return enhancedError.data.errors.map((e: any) => 
            typeof e === 'string' ? e : (e.message || e.error || JSON.stringify(e))
          ).join('. ');
        }
      }
    }
    
    // Fall back to error message
    return enhancedError.message;
  }
  
  // Handle standard error types
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('Network error') ||
        error.message.includes('NetworkError')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return 'Request timed out. Please try again later.';
    }
    
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle objects with message property
  if (typeof error === 'object' && error !== null) {
    if ('message' in error) {
      return String(error.message);
    }
    
    // Handle other common properties
    if ('error' in error) {
      return String(error.error);
    }
    if ('errorMessage' in error) {
      return String(error.errorMessage);
    }
    
    try {
      // Try to stringify the object, but handle circular references
      return JSON.stringify(error);
    } catch (e) {
      return 'An error occurred (details cannot be displayed)';
    }
  }
  
  // Default fallback
  return 'An unexpected error occurred';
}

/**
 * Enhances an error with additional metadata
 * Creates a structured error from any error type
 * 
 * @param error Original error
 * @param additionalInfo Additional context to add to the error
 * @returns Enhanced error with rich metadata
 */
export function enhanceError(
  error: unknown, 
  additionalInfo: Partial<EnhancedError> = {}
): EnhancedError {
  let message = '';
  let type = ErrorType.UNKNOWN;
  let status: number | undefined = undefined;
  
  // Process API errors
  if (error instanceof Error && 'status' in error) {
    const apiError = error as ApiError;
    status = apiError.status;
    type = getErrorTypeFromStatus(status);
    message = extractErrorMessage(apiError);
  } 
  // Handle standard errors
  else if (error instanceof Error) {
    message = error.message;
    
    // Detect network errors
    if (message.includes('Failed to fetch') || 
        message.includes('Network error') ||
        message.includes('NetworkError')) {
      type = ErrorType.NETWORK;
    }
    
    // Detect timeout errors
    if (message.includes('timeout') || message.includes('Timeout')) {
      type = ErrorType.TIMEOUT;
    }
  } 
  // Handle primitive errors
  else {
    message = extractErrorMessage(error);
  }

  // Create enhanced error with all metadata
  const enhancedError = new Error(message) as EnhancedError;
  enhancedError.type = additionalInfo.type || type;
  enhancedError.status = additionalInfo.status || status;
  enhancedError.originalError = error;
  enhancedError.timestamp = additionalInfo.timestamp || new Date().toISOString();
  enhancedError.recoverable = additionalInfo.recoverable ?? isRecoverableError(enhancedError.type);
  enhancedError.recoverySuggestion = additionalInfo.recoverySuggestion || getRecoverySuggestion(enhancedError.type);
  
  // Add any additional context
  if (additionalInfo.data) enhancedError.data = additionalInfo.data;
  if (additionalInfo.url) enhancedError.url = additionalInfo.url;
  if (additionalInfo.method) enhancedError.method = additionalInfo.method;
  if (additionalInfo.requestData) enhancedError.requestData = additionalInfo.requestData;
  if (additionalInfo.retryCount !== undefined) enhancedError.retryCount = additionalInfo.retryCount;
  
  return enhancedError;
}

/**
 * Hook for standardized error handling with toast notifications
 * Returns a callback function that can be used to handle errors consistently
 */
export function useErrorHandler() {
  const { toast } = useToast();
  
  return useCallback((error: unknown, title?: string) => {
    // Enhance error with metadata
    const enhancedError = enhanceError(error);
    const message = enhancedError.message || extractErrorMessage(error);
    
    // Determine toast variant and title based on error type
    let variant: "destructive" | "default" = "destructive";
    let errorTitle = title || "Error";
    
    switch (enhancedError.type) {
      case ErrorType.NETWORK:
        variant = "default";
        errorTitle = title || "Connection Issue";
        break;
      case ErrorType.TIMEOUT:
        variant = "default";
        errorTitle = title || "Request Timeout";
        break;
      case ErrorType.AUTHENTICATION:
        errorTitle = title || "Authentication Required";
        break;
      case ErrorType.VALIDATION:
        errorTitle = title || "Validation Error";
        break;
      case ErrorType.SERVER:
        errorTitle = title || "Server Error";
        break;
    }
    
    // Show simple toast notification without JSX (for TypeScript compatibility)
    toast({
      title: errorTitle,
      description: enhancedError.recoverable 
        ? `${message} (Click 'Retry' if the problem persists)` 
        : message,
      variant
    });
    
    // Log detailed error for debugging
    console.error('[Error]:', { 
      title: errorTitle,
      message, 
      type: enhancedError.type,
      status: enhancedError.status,
      timestamp: enhancedError.timestamp,
      recoverable: enhancedError.recoverable,
      originalError: enhancedError.originalError
    });
  }, [toast]);
}

/**
 * Hook for retry logic with exponential backoff
 * Useful for automatic recovery from transient errors
 */
export function useErrorRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    retryableTypes?: ErrorType[];
  } = {}
) {
  const { 
    maxRetries = 3, 
    initialDelay = 1000, 
    maxDelay = 10000,
    retryableTypes = [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.SERVER]
  } = options;
  
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  
  const executeWithRetry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fn();
      setResult(data);
      setAttempt(0);
      return data;
    } catch (err) {
      const enhancedErr = enhanceError(err, { retryCount: attempt + 1 });
      
      // Only retry for specific error types
      const shouldRetry = 
        attempt < maxRetries && 
        retryableTypes.includes(enhancedErr.type);
      
      if (shouldRetry) {
        setAttempt(prev => prev + 1);
        // Calculate exponential backoff delay
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        
        // Schedule retry
        setTimeout(() => {
          executeWithRetry();
        }, delay);
      } else {
        setError(enhancedErr);
      }
      
      throw enhancedErr;
    } finally {
      setIsLoading(false);
    }
  }, [fn, attempt, maxRetries, initialDelay, maxDelay, retryableTypes]);
  
  // Reset state when function changes
  useEffect(() => {
    setAttempt(0);
    setError(null);
    setResult(null);
  }, [fn]);
  
  return {
    execute: executeWithRetry,
    reset: () => {
      setAttempt(0);
      setError(null);
      setResult(null);
    },
    retry: () => {
      if (attempt < maxRetries) {
        executeWithRetry();
      }
    },
    error,
    isLoading,
    attempt,
    result,
    hasExhaustedRetries: attempt >= maxRetries && error !== null
  };
}

/**
 * Standardized error handler for API errors
 * Preserves error context, enhances with additional metadata, and provides rich context
 * 
 * @param error Original error object
 * @returns Never completes normally, always throws an enhanced error
 */
export function handleApiError(error: unknown): never {
  // Already an enhanced error with proper type
  if (error instanceof Error && 'type' in error) {
    throw error;
  }
  
  // Already an API error with status but no type
  if (error instanceof Error && 'status' in error) {
    const apiError = error as ApiError;
    const errorType = getErrorTypeFromStatus(apiError.status);
    
    // Create new enhanced error
    const enhancedError = enhanceError(error, {
      type: errorType,
      status: apiError.status,
      data: apiError.data,
      url: apiError.url,
      method: apiError.method,
      requestData: apiError.requestData,
      timestamp: apiError.timestamp
    });
    
    throw enhancedError;
  }
  
  // Standard error or unknown error type
  const message = extractErrorMessage(error);
  const enhancedError = enhanceError(error, {
    message: `API Error: ${message}`
  });
  
  throw enhancedError;
} 