import React from 'react';
import { cn } from '../../lib/utils.js';

/**
 * Form field component that provides consistent layout for form inputs
 * Includes label, input control, and error message support
 * 
 * @example
 * ```tsx
 * <FormField
 *   label="Job Title"
 *   htmlFor="jobTitle"
 *   error={errors.jobTitle}
 *   domain="offer-vault"
 * >
 *   <Input 
 *     id="jobTitle"
 *     name="jobTitle" 
 *     value={formData.jobTitle}
 *     onChange={handleChange}
 *     domain="offer-vault"
 *     hasError={!!errors.jobTitle}
 *   />
 * </FormField>
 * ```
 */
export function FormField({
  children,
  label,
  htmlFor,
  error,
  description,
  className,
  domain = "default",
  required = false,
  ...props
}) {
  // Domain-specific styles
  const labelStyles = {
    "thinking-desk": "text-thinking-desk-primary",
    "offer-vault": "text-offer-vault-primary",
    "decision-log": "text-decision-log-primary",
    "personal-clarity": "text-personal-clarity-primary",
    "default": "",
  }[domain];

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <label 
          htmlFor={htmlFor}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            labelStyles
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}