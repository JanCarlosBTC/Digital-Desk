import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

export const formFieldVariants = cva(
  "mb-4",
  {
    variants: {
      spacing: {
        default: "mb-4",
        tight: "mb-2",
        none: "mb-0",
      },
      layout: {
        vertical: "flex flex-col",
        horizontal: "flex flex-row items-center gap-2",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      spacing: "default",
      layout: "vertical",
      fullWidth: true,
    },
  }
);

export const formLabelVariants = cva(
  "text-sm font-medium",
  {
    variants: {
      isRequired: {
        true: "after:content-['*'] after:text-destructive after:ml-0.5",
      },
      isDisabled: {
        true: "opacity-50 cursor-not-allowed",
      },
      layout: {
        vertical: "mb-2 block",
        horizontal: "min-w-32",
      },
    },
    defaultVariants: {
      isRequired: false,
      isDisabled: false,
      layout: "vertical",
    },
  }
);

export const formHintVariants = cva(
  "text-xs text-muted-foreground mt-1",
  {
    variants: {
      variant: {
        default: "",
        error: "text-destructive",
        success: "text-success",
        warning: "text-warning",
        info: "text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
  label?: string;
  labelFor?: string;
  hint?: string;
  hintVariant?: VariantProps<typeof formHintVariants>["variant"];
  isRequired?: boolean;
  isDisabled?: boolean;
  layout?: "vertical" | "horizontal";
  fullWidth?: boolean;
}

/**
 * Form field component
 * 
 * A wrapper for form controls that includes a label and optional hint text.
 * 
 * @example
 * ```tsx
 * <FormField label="Email" labelFor="email" hint="We'll never share your email" isRequired>
 *   <Input id="email" type="email" />
 * </FormField>
 * ```
 */
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({
    className,
    spacing,
    label,
    labelFor,
    hint,
    hintVariant,
    isRequired = false,
    isDisabled = false,
    layout = "vertical",
    fullWidth = true,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          formFieldVariants({
            spacing,
            layout,
            fullWidth,
            className,
          })
        )}
        {...props}
      >
        {label && (
          <label
            htmlFor={labelFor}
            className={cn(
              formLabelVariants({
                isRequired,
                isDisabled,
                layout,
              })
            )}
          >
            {label}
          </label>
        )}
        {children}
        {hint && (
          <p
            className={cn(
              formHintVariants({
                variant: hintVariant,
              })
            )}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };