import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

export const inputVariants = cva(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        outline: "border-2",
        filled: "bg-muted/50 border-transparent hover:bg-muted/80 focus:bg-transparent",
        underlined: "border-0 border-b rounded-none",
      },
      domain: {
        "thinking-desk": "focus-visible:ring-thinking-desk-primary",
        "offer-vault": "focus-visible:ring-offer-vault-primary",
        "decision-log": "focus-visible:ring-decision-log-primary",
        "personal-clarity": "focus-visible:ring-personal-clarity-primary",
        default: "",
      },
      inputSize: {
        default: "h-9 px-3 py-1",
        xs: "h-7 px-2 py-0.5 text-xs",
        sm: "h-8 px-3 py-0.5 text-sm",
        lg: "h-10 px-4 py-2 text-base",
        xl: "h-12 px-6 py-3 text-lg",
      },
      isError: {
        true: "border-destructive focus-visible:ring-destructive",
      },
      isSuccess: {
        true: "border-success focus-visible:ring-success",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      domain: "default",
      inputSize: "default",
      isError: false,
      isSuccess: false,
      fullWidth: true,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, 
    Omit<VariantProps<typeof inputVariants>, 'inputSize'> {
  isError?: boolean;
  isSuccess?: boolean;
  errorMessage?: string;
  successMessage?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  inputSize?: 'default' | 'xs' | 'sm' | 'lg' | 'xl';
}

/**
 * Input component with various styles and states
 * 
 * @example
 * ```tsx
 * <Input placeholder="Enter your name" />
 * <Input variant="filled" domain="thinking-desk" />
 * <Input isError={true} errorMessage="This field is required" />
 * <Input leadingIcon={<SearchIcon />} placeholder="Search..." />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    domain,
    inputSize = 'default',
    isError,
    isSuccess,
    errorMessage,
    successMessage,
    leadingIcon,
    trailingIcon,
    fullWidth,
    type,
    ...props
  }, ref) => {
    return (
      <div className={cn("relative", fullWidth ? "w-full" : "w-auto")}>
        {leadingIcon && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leadingIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({
              variant,
              domain,
              inputSize,
              isError,
              isSuccess,
              fullWidth,
              className,
            }),
            leadingIcon && "pl-8",
            trailingIcon && "pr-8"
          )}
          ref={ref}
          {...props}
        />
        {trailingIcon && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            {trailingIcon}
          </div>
        )}
        {isError && errorMessage && (
          <p className="mt-1 text-xs text-destructive">{errorMessage}</p>
        )}
        {isSuccess && successMessage && (
          <p className="mt-1 text-xs text-success">{successMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };