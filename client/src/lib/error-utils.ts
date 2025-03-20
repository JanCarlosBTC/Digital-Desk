import { useToast } from "@/hooks/use-toast";
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
  UNKNOWN = 'unknown',
  BUSINESS_LOGIC = 'business_logic'  // Added for domain-specific errors
}

/**
 * Error severity levels for prioritizing error handling
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Structured error data interface for better type safety
 */
export interface ErrorData {
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
  validationErrors?: Record<string, string[]>;
  [key: string]: unknown;
}

/**
 * Enhanced error interface with more metadata for debugging and user feedback
 */
export interface EnhancedError extends Error {
  type: ErrorType;
  severity?: ErrorSeverity;
  status?: number;
  data?: ErrorData;
  url?: string;
  method?: string;
  timestamp: string;
  recoverable: boolean;
  retryCount?: number;
  recoverySuggestion: string;
  preventDuplication?: boolean;
  operationId?: string;
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
  if (status === 422) return ErrorType.VALIDATION;
  if (status >= 400 && status < 500) return ErrorType.VALIDATION;
  if (status >= 500) return ErrorType.SERVER;
  
  return ErrorType.UNKNOWN;
}

/**
 * Maps error types to severity levels for prioritizing error handling
 * 
 * @param errorType Type of error
 * @returns Appropriate severity level
 */
export function getSeverityFromErrorType(errorType: ErrorType): ErrorSeverity {
  switch (errorType) {
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return ErrorSeverity.HIGH;
    case ErrorType.SERVER:
      return ErrorSeverity.HIGH;
    case ErrorType.NETWORK:
    case ErrorType.TIMEOUT:
      return ErrorSeverity.MEDIUM;
    case ErrorType.VALIDATION:
    case ErrorType.BUSINESS_LOGIC:
      return ErrorSeverity.MEDIUM;
    case ErrorType.NOT_FOUND:
      return ErrorSeverity.LOW;
    default:
      return ErrorSeverity.MEDIUM;
  }
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
    case ErrorType.VALIDATION:
    case ErrorType.BUSINESS_LOGIC:
      return true;
    case ErrorType.SERVER:
    case ErrorType.UNKNOWN:
    case ErrorType.NOT_FOUND:
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
    case ErrorType.BUSINESS_LOGIC:
      return 'There was a problem processing your request. Please check the details and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Safely extracts a value from an object with type checking
 * 
 * @param obj The object to extract from
 * @param key The key to extract
 * @param defaultValue Default value if key doesn't exist or is wrong type
 * @returns The extracted value with correct type
 */
function safeExtract<T>(obj: unknown, key: string, defaultValue: T): T {
  if (obj && typeof obj === 'object' && key in obj) {
    const value = (obj as Record<string, unknown>)[key];
    // Type checking to ensure we only return values of the correct type
    if (typeof value === typeof defaultValue) {
      return value as T;
    }
  }
  return defaultValue;
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
        // Handle common API error response formats with type safety
        const errorData = enhancedError.data;
        
        // Try various common message properties
        if (errorData.message && typeof errorData.message === 'string') {
          return errorData.message;
        }
        
        if (errorData.error && typeof errorData.error === 'string') {
          return errorData.error;
        }
        
        // Handle validation errors
        if (errorData.validationErrors && typeof errorData.validationErrors === 'object') {
          const validationErrors = errorData.validationErrors;
          const errorMessages: string[] = [];
          
          // Type-safe extraction of validation errors
          Object.entries(validationErrors).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach(error => {
                if (typeof error === 'string') {
                  errorMessages.push(`${field}: ${error}`);
                }
              });
            }
          });
          
          if (errorMessages.length > 0) {
            return errorMessages.join('. ');
          }
        }
        
        // Handle arrays of errors
        if ('errors' in errorData && Array.isArray(errorData.errors)) {
          const errors = errorData.errors as unknown[];
          return errors.map((e) => 
            typeof e === 'string' ? e : (
              safeExtract(e, 'message', '') || 
              safeExtract(e, 'error', '') || 
              JSON.stringify(e)
            )
          ).filter(Boolean).join('. ');
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
  
  // Handle objects with message property, with type safety
  if (error !== null && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    
    // Try common error properties with type checking
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    if ('error' in errorObj && typeof errorObj.error === 'string') {
      return errorObj.error;
    }
    
    if ('errorMessage' in errorObj && typeof errorObj.errorMessage === 'string') {
      return errorObj.errorMessage;
    }
    
    try {
      // Try to stringify the object, with circular reference handling
      return JSON.stringify(error, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          // Handle circular references in JSON serialization
          const seen = new WeakSet();
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }
        return value;
      });
    } catch (e) {
      return 'An error occurred (details cannot be displayed)';
    }
  }
  
  // Default fallback
  return 'An unexpected error occurred';
}

/**
 * Generates a unique operation ID for tracking related errors
 */
function generateOperationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
  const timestamp = additionalInfo.timestamp || new Date().toISOString();
  const operationId = additionalInfo.operationId || generateOperationId();
  
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
    
    // Detect network errors with improved pattern matching
    if (message.includes('Failed to fetch') || 
        message.includes('Network error') ||
        message.includes('NetworkError') ||
        message.includes('net::ERR_') ||
        message.includes('xhr error')) {
      type = ErrorType.NETWORK;
    }
    
    // Detect timeout errors with improved pattern matching
    if (message.includes('timeout') || 
        message.includes('Timeout') ||
        message.includes('timed out') ||
        message.includes('ETIMEDOUT')) {
      type = ErrorType.TIMEOUT;
    }
  } 
  // Handle primitive errors
  else {
    message = extractErrorMessage(error);
  }

  // Override with explicit type if provided
  type = additionalInfo.type || type;
  
  // Create enhanced error with all metadata
  const enhancedError = new Error(message) as EnhancedError;
  enhancedError.type = type;
  enhancedError.status = additionalInfo.status || status;
  enhancedError.originalError = error;
  enhancedError.timestamp = timestamp;
  enhancedError.operationId = operationId;
  enhancedError.recoverable = additionalInfo.recoverable ?? isRecoverableError(type);
  enhancedError.recoverySuggestion = additionalInfo.recoverySuggestion || getRecoverySuggestion(type);
  enhancedError.severity = additionalInfo.severity || getSeverityFromErrorType(type);
  
  // Add structured error data
  if (additionalInfo.data) {
    enhancedError.data = additionalInfo.data;
  } else if (error instanceof Error && 'data' in error) {
    // Safely convert to our typed ErrorData structure
    const sourceData = (error as ApiError).data;
    if (sourceData && typeof sourceData === 'object') {
      const errorData: ErrorData = {};
      
      // Safely extract common fields with type checking
      if ('message' in sourceData && typeof sourceData.message === 'string') {
        errorData.message = sourceData.message;
      }
      
      if ('code' in sourceData && typeof sourceData.code === 'string') {
        errorData.code = sourceData.code;
      }
      
      if ('details' in sourceData && typeof sourceData.details === 'object') {
        errorData.details = sourceData.details as Record<string, unknown>;
      }
      
      if ('validationErrors' in sourceData && typeof sourceData.validationErrors === 'object') {
        errorData.validationErrors = sourceData.validationErrors as Record<string, string[]>;
      }
      
      // Copy any other properties
      Object.entries(sourceData).forEach(([key, value]) => {
        if (!['message', 'code', 'details', 'validationErrors'].includes(key)) {
          errorData[key] = value;
        }
      });
      
      enhancedError.data = errorData;
    }
  }
  
  // Add any additional context
  if (additionalInfo.url) enhancedError.url = additionalInfo.url;
  if (additionalInfo.method) enhancedError.method = additionalInfo.method;
  if (additionalInfo.requestData) enhancedError.requestData = additionalInfo.requestData;
  if (additionalInfo.retryCount !== undefined) enhancedError.retryCount = additionalInfo.retryCount;
  if (additionalInfo.preventDuplication !== undefined) enhancedError.preventDuplication = additionalInfo.preventDuplication;
  
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
      case ErrorType.AUTHORIZATION:
        errorTitle = title || "Access Denied";
        break;
      case ErrorType.VALIDATION:
        errorTitle = title || "Validation Error";
        break;
      case ErrorType.SERVER:
        errorTitle = title || "Server Error";
        break;
      case ErrorType.BUSINESS_LOGIC:
        errorTitle = title || "Application Error";
        break;
    }
    
    // Show toast notification
    toast({
      title: errorTitle,
      description: enhancedError.recoverable 
        ? `${message} (Click 'Retry' if the problem persists)` 
        : message,
      variant
    });
    
    // Enhanced error logging with better context
    console.error(`[Error ${enhancedError.operationId}]:`, { 
      title: errorTitle,
      message, 
      type: enhancedError.type,
      severity: enhancedError.severity,
      status: enhancedError.status,
      timestamp: enhancedError.timestamp,
      recoverable: enhancedError.recoverable,
      data: enhancedError.data,
      url: enhancedError.url,
      originalError: enhancedError.originalError
    });
  }, [toast]);
}

// Type for retry options with improved typings
export interface ErrorRetryOptions<T> {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  retryableTypes?: ErrorType[];
  onRetry?: (attempt: number, error: EnhancedError) => void;
  retryCondition?: (error: EnhancedError, attempt: number) => boolean;
  onSuccess?: (data: T) => void;
}

/**
 * Hook for retry logic with exponential backoff
 * Useful for automatic recovery from transient errors
 */
export function useErrorRetry<T>(
  fn: () => Promise<T>,
  options: ErrorRetryOptions<T> = {}
) {
  const { 
    maxRetries = 3, 
    initialDelay = 1000, 
    maxDelay = 10000,
    retryableTypes = [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.SERVER],
    onRetry,
    retryCondition,
    onSuccess
  } = options;
  
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  
  const executeWithRetry = useCallback(async (): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fn();
      setResult(data);
      setAttempt(0);
      if (onSuccess) {
        onSuccess(data);
      }
      return data;
    } catch (err) {
      const enhancedErr = enhanceError(err, { 
        retryCount: attempt + 1,
        operationId: error?.operationId // Preserve operation ID across retries
      });
      
      // Determine if we should retry
      let shouldRetry = attempt < maxRetries && retryableTypes.includes(enhancedErr.type);
      
      // Allow custom retry condition to override default logic
      if (retryCondition) {
        shouldRetry = retryCondition(enhancedErr, attempt);
      }
      
      if (shouldRetry) {
        setAttempt(prev => prev + 1);
        // Calculate exponential backoff delay with jitter for better distributed retries
        const baseDelay = initialDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
        const delay = Math.min(baseDelay + jitter, maxDelay);
        
        // Optional callback for monitoring retries
        if (onRetry) {
          onRetry(attempt + 1, enhancedErr);
        }
        
        // Schedule retry with improved error handling
        const retryTimeout = setTimeout(() => {
          executeWithRetry().catch(e => {
            // This should only happen if the promise rejection isn't handled elsewhere
            console.error("Unhandled retry error:", e);
          });
        }, delay);
        
        // Clean up timeout if component unmounts
        return new Promise<T>((_, reject) => {
          const cleanup = () => {
            clearTimeout(retryTimeout);
            reject(enhancedErr);
          };
          
          // Assign cleanup to a property so it can be called externally if needed
          Object.assign(enhancedErr, { cancelRetry: cleanup });
        });
      } else {
        setError(enhancedErr);
      }
      
      throw enhancedErr;
    } finally {
      setIsLoading(false);
    }
  }, [fn, attempt, maxRetries, initialDelay, maxDelay, retryableTypes, onRetry, retryCondition, onSuccess, error?.operationId]);
  
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
        executeWithRetry().catch(e => {
          console.error("Error during manual retry:", e);
        });
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
      timestamp: apiError.timestamp || new Date().toISOString()
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