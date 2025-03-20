import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

/**
 * Centralized validation utilities
 * - Standardizes how validation is handled across components
 * - Improves type safety with Zod schemas
 * - Provides consistent error handling
 */

/**
 * Standard response for validated form data
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Helper function to validate data with a Zod schema
 * Returns a standardized validation result
 */
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to a friendly format
      const fieldErrors: Record<string, string> = {};
      let firstError = '';
      
      error.errors.forEach((err) => {
        const field = err.path.join('.');
        const message = err.message;
        
        if (!firstError) {
          firstError = message;
        }
        
        fieldErrors[field] = message;
      });
      
      return {
        success: false,
        error: firstError,
        fieldErrors
      };
    }
    
    // Handle unexpected errors
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    };
  }
}

/**
 * Hook to handle form validation and display error toast messages
 */
export function useFormValidation() {
  const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> => {
    const result = validateWithZod(schema, data);
    
    if (!result.success && result.error) {
      toast({
        title: 'Validation Error',
        description: result.error,
        variant: 'destructive'
      });
    }
    
    return result;
  };
  
  return { validateForm };
}

/**
 * Common validation schemas that can be reused across forms
 */
 
// User-facing text field - short text (name, title, etc)
export const textFieldSchema = (fieldName: string, minLength = 2, maxLength = 100) => 
  z.string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`)
    .transform(str => str.trim());

// Longer text content (description, notes, etc)
export const contentFieldSchema = (fieldName: string, minLength = 10, maxLength = 2000) => 
  z.string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`)
    .transform(str => str.trim());

// Email validation
export const emailSchema = z.string()
  .email('Invalid email format')
  .transform(str => str.trim().toLowerCase());

// URL validation
export const urlSchema = z.string()
  .url('Invalid URL format')
  .transform(str => str.trim());

// Number in range
export const numberRangeSchema = (fieldName: string, min = 0, max = 100) => 
  z.number()
    .min(min, `${fieldName} must be at least ${min}`)
    .max(max, `${fieldName} must be at most ${max}`);

// Date validation (not in past)
export const futureDateSchema = z.date()
  .refine(date => date >= new Date(Date.now() - 86400000), { // Allow today (subtract 24h to account for timezone issues)
    message: 'Date must not be in the past'
  });

// String array with validation
export const stringArraySchema = (fieldName: string, minItems = 0) => 
  z.array(z.string().trim().min(1, `${fieldName} item cannot be empty`))
    .min(minItems, minItems > 0 ? `At least ${minItems} ${fieldName} required` : undefined); 