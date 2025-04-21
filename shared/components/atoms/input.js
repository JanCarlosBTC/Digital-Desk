import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const inputVariants = cva(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      domain: {
        "thinking-desk": "focus-visible:ring-thinking-desk-primary/70",
        "offer-vault": "focus-visible:ring-offer-vault-primary/70",
        "decision-log": "focus-visible:ring-decision-log-primary/70",
        "personal-clarity": "focus-visible:ring-personal-clarity-primary/70",
        default: "focus-visible:ring-ring",
      },
      size: {
        default: "h-9",
        sm: "h-8 text-xs px-2.5 py-0.5",
        lg: "h-10 text-base px-4 py-2",
      },
      hasError: {
        true: "border-destructive focus-visible:ring-destructive",
        false: "",
      }
    },
    defaultVariants: {
      domain: "default",
      size: "default",
      hasError: false,
    },
  }
);

/**
 * Input component with various styles and states
 * 
 * @example
 * ```tsx
 * <Input 
 *   placeholder="Enter your job title" 
 *   domain="offer-vault"
 *   onChange={handleChange} 
 * />
 * 
 * <Input 
 *   value={formData.email}
 *   onChange={handleChange}
 *   name="email"
 *   hasError={!!errors.email}
 * />
 * ```
 */
export function Input({
  className,
  type = "text",
  domain = "default",
  size = "default",
  hasError = false,
  ...props
}) {
  return (
    <input
      type={type}
      className={cn(inputVariants({ domain, size, hasError, className }))}
      {...props}
    />
  );
}