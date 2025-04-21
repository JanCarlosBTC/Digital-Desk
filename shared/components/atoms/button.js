import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        info: "bg-info text-info-foreground hover:bg-info/90",
        // Domain-specific variants
        "thinking-desk": "bg-thinking-desk-primary text-primary-foreground hover:bg-thinking-desk-primary/90",
        "offer-vault": "bg-offer-vault-primary text-primary-foreground hover:bg-offer-vault-primary/90",
        "decision-log": "bg-decision-log-primary text-primary-foreground hover:bg-decision-log-primary/90",
        "personal-clarity": "bg-personal-clarity-primary text-primary-foreground hover:bg-personal-clarity-primary/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Button component with various styles and states
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click Me
 * </Button>
 * 
 * <Button variant="thinking-desk" leadingIcon={<BrainIcon />}>
 *   Brain Dump
 * </Button>
 * ```
 */
export function Button({
  className,
  variant,
  size,
  isLoading = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {!isLoading && leadingIcon && (
        <span className="mr-2">{leadingIcon}</span>
      )}
      {children}
      {trailingIcon && (
        <span className="ml-2">{trailingIcon}</span>
      )}
    </button>
  );
}