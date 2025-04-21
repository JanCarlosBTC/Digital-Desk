import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

export const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        outline: "border-2",
        ghost: "border-transparent shadow-none",
        elevated: "border-transparent shadow-md",
      },
      spacing: {
        default: "p-6",
        compact: "p-4",
        spacious: "p-8",
        none: "p-0",
      },
      domain: {
        "thinking-desk": "border-thinking-desk-primary/20",
        "offer-vault": "border-offer-vault-primary/20",
        "decision-log": "border-decision-log-primary/20",
        "personal-clarity": "border-personal-clarity-primary/20",
        default: "",
      },
      isInteractive: {
        true: "hover:shadow-md cursor-pointer transition-shadow duration-200",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      spacing: "default",
      domain: "default",
      isInteractive: false,
      fullWidth: true,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  isInteractive?: boolean;
  fullWidth?: boolean;
}

/**
 * Card component with various styles and options
 * 
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Card Content</CardContent>
 *   <CardFooter>Card Footer</CardFooter>
 * </Card>
 * ```
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant,
    spacing,
    domain,
    isInteractive,
    fullWidth,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({
            variant,
            spacing,
            domain,
            isInteractive,
            fullWidth,
            className,
          })
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  centered?: boolean;
}

/**
 * Card header component
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, centered = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5 p-6",
          centered && "items-center text-center",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

/**
 * Card title component
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Comp = "h3", children, ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn("font-semibold leading-none tracking-tight", className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * Card description component
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
});
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "default" | "none";
}

/**
 * Card content component
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, spacing = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          spacing === "default" ? "p-6 pt-0" : "",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  centered?: boolean;
}

/**
 * Card footer component
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, centered = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center p-6 pt-0",
          centered ? "justify-center" : "justify-between",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};