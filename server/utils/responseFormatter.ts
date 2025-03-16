/**
 * Standardized API response formatter
 * Ensures consistent structure across all API responses
 */

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  timestamp: string;
  errors?: Record<string, string[]>;
}

/**
 * Creates a success response with standardized format
 */
export function successResponse<T>(data: T, message = "Operation successful", status = 200): ApiResponse<T> {
  return {
    success: true,
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates an error response with standardized format
 */
export function errorResponse(
  message = "An error occurred", 
  status = 500, 
  errors?: Record<string, string[]>
): ApiResponse {
  return {
    success: false,
    status,
    message,
    timestamp: new Date().toISOString(),
    errors
  };
}

/**
 * Creates a not found response
 */
export function notFoundResponse(message = "Resource not found"): ApiResponse {
  return errorResponse(message, 404);
}

/**
 * Creates a validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string[]>, 
  message = "Validation failed"
): ApiResponse {
  return {
    success: false,
    status: 422,
    message,
    timestamp: new Date().toISOString(),
    errors
  };
}