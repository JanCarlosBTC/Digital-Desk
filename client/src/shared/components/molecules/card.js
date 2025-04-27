import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../shared/lib/utils.js';

const cardVariants = cva(
  "rounded-lg border shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        ghost: "border-none shadow-none bg-transparent",
      },
      domain: {
        "thinking-desk": "border-thinking-desk-primary/20",
        "offer-vault": "border-offer-vault-primary/20",
        "decision-log": "border-decision-log-primary/20",
        "personal-clarity": "border-personal-clarity-primary/20",
        default: "border-border",
      },
    },
    defaultVariants: {
      variant: "default",
      domain: "default",
    },
  }
);

/**
 * Card component for displaying content in a contained box
 * 
 * @example
 * ```tsx
 * <Card domain="offer-vault">
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Card content
 *   </CardContent>
 *   <CardFooter>
 *     Card footer
 *   </CardFooter>
 * </Card>
 * ```
 */
export function Card({
  className,
  variant,
  domain = "default",
  ...props
}) {
  return (
    <div
      className={cn(cardVariants({ variant, domain }), className)}
      {...props}
    />
  );
}

/**
 * Card header component
 */
export function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

/**
 * Card title component
 */
export function CardTitle({
  className,
  ...props
}) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

/**
 * Card description component
 */
export function CardDescription({
  className,
  ...props
}) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * Card content component
 */
export function CardContent({
  className,
  ...props
}) {
  return (
    <div
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  );
}

/**
 * Card footer component
 */
export function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}