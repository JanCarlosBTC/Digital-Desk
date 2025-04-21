import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

/**
 * Button component with various styles and states
 * 
 * This is a core UI component that can be customized with different
 * variants, sizes, and states (loading, disabled).
 */

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground shadow-sm hover:bg-success/90",
        warning: "bg-warning text-warning-foreground shadow-sm hover:bg-warning/90",
        info: "bg-info text-info-foreground shadow-sm hover:bg-info/90",
        
        // Domain-specific variants
        "thinking-desk": "bg-thinking-desk-primary text-primary-foreground shadow hover:bg-thinking-desk-primary/90",
        "offer-vault": "bg-offer-vault-primary text-primary-foreground shadow hover:bg-offer-vault-primary/90",
        "decision-log": "bg-decision-log-primary text-primary-foreground shadow hover:bg-decision-log-primary/90",
        "personal-clarity": "bg-personal-clarity-primary text-primary-foreground shadow hover:bg-personal-clarity-primary/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 px-2 py-1 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
        "icon-lg": "h-11 w-11",
      },
      isLoading: {
        true: "cursor-not-allowed opacity-70",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      isLoading: false,
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loadingText?: string;
}

/**
 * Button component with various styles and states
 * 
 * @example
 * ```tsx
 * <Button variant="default" size="default">Click me</Button>
 * <Button variant="thinking-desk" isLoading={true}>Processing</Button>
 * <Button variant="outline" leadingIcon={<ArrowLeftIcon />}>Back</Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    isLoading = false,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    loadingText,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, isLoading, fullWidth, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingText || children}
          </>
        ) : (
          <>
            {leadingIcon && <span className="mr-2">{leadingIcon}</span>}
            {children}
            {trailingIcon && <span className="ml-2">{trailingIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button };