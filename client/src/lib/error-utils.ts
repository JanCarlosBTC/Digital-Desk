import { useToast } from "@/components/ui/use-toast";
import { useCallback } from "react";

/**
 * Interface for structured API errors with additional metadata
 */
interface ApiError extends Error {
  status?: number;
  data?: any;
  originalError?: unknown;
}

/**
 * Extracts a human-readable error message from various error types
 * Handles structured API errors, standard Error objects, strings, and objects with message properties
 */
export function extractErrorMessage(error: unknown): string {
  // Handle our enhanced API errors
  if (error instanceof Error && 'status' in error && error.status) {
    const apiError = error as ApiError;
    
    // Use status-specific error formatting
    const status = apiError.status || 0;
    if (status === 401) {
      return 'Authentication required. Please sign in again.';
    }
    if (status === 403) {
      return 'You don\'t have permission to access this resource.';
    }
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    if (status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    // Extract structured error data if available
    if (apiError.data) {
      if (typeof apiError.data === 'object' && apiError.data.message) {
        return apiError.data.message;
      }
      if (typeof apiError.data === 'object' && apiError.data.error) {
        return apiError.data.error;
      }
    }
    
    // Fall back to error message
    return apiError.message;
  }
  
  // Handle standard error types
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  
  // Default fallback
  return 'An unexpected error occurred';
}

/**
 * Hook for standardized error handling with toast notifications
 * Returns a callback function that can be used to handle errors consistently
 */
export function useErrorHandler() {
  const { toast } = useToast();
  
  return useCallback((error: unknown, title = "Error") => {
    const message = extractErrorMessage(error);
    
    // Determine toast variant based on error type
    let variant: "destructive" | "default" = "destructive";
    
    // Apply special handling for network errors (less alarming UI)
    if (error instanceof Error && 'originalError' in error) {
      // Network/connection errors are less alarming
      if (error.message.includes('Network error')) {
        variant = "default";
        title = "Connection Issue";
      }
    }
    
    // Show toast notification
    toast({
      title,
      description: message,
      variant
    });
    
    // Log detailed error for debugging
    console.error('[Error]:', { 
      title, 
      message, 
      error,
      timestamp: new Date().toISOString()
    });
  }, [toast]);
}

/**
 * Standardized error handler for API errors
 * Preserves error context and enhances with additional metadata
 */
export function handleApiError(error: unknown): never {
  // If it's already an enhanced error, just rethrow
  if (error instanceof Error && ('status' in error || 'originalError' in error)) {
    throw error;
  }
  
  // Create an enhanced error with the extracted message
  const message = extractErrorMessage(error);
  const enhancedError = new Error(`API Error: ${message}`);
  (enhancedError as ApiError).originalError = error;
  
  throw enhancedError;
} 