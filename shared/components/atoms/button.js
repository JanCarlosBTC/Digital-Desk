import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      domain: {
        "thinking-desk": "focus-visible:ring-thinking-desk-primary/70 data-[state=open]:bg-thinking-desk-primary/10",
        "offer-vault": "focus-visible:ring-offer-vault-primary/70 data-[state=open]:bg-offer-vault-primary/10",
        "decision-log": "focus-visible:ring-decision-log-primary/70 data-[state=open]:bg-decision-log-primary/10",
        "personal-clarity": "focus-visible:ring-personal-clarity-primary/70 data-[state=open]:bg-personal-clarity-primary/10",
        default: "focus-visible:ring-ring",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        domain: "thinking-desk",
        class: "bg-thinking-desk-primary text-thinking-desk-primary-foreground hover:bg-thinking-desk-primary/90",
      },
      {
        variant: "default",
        domain: "offer-vault",
        class: "bg-offer-vault-primary text-offer-vault-primary-foreground hover:bg-offer-vault-primary/90",
      },
      {
        variant: "default",
        domain: "decision-log",
        class: "bg-decision-log-primary text-decision-log-primary-foreground hover:bg-decision-log-primary/90",
      },
      {
        variant: "default",
        domain: "personal-clarity",
        class: "bg-personal-clarity-primary text-personal-clarity-primary-foreground hover:bg-personal-clarity-primary/90",
      },
      {
        variant: "secondary",
        domain: "thinking-desk",
        class: "bg-thinking-desk-secondary text-thinking-desk-secondary-foreground hover:bg-thinking-desk-secondary/80",
      },
      {
        variant: "secondary",
        domain: "offer-vault",
        class: "bg-offer-vault-secondary text-offer-vault-secondary-foreground hover:bg-offer-vault-secondary/80",
      },
      {
        variant: "secondary",
        domain: "decision-log",
        class: "bg-decision-log-secondary text-decision-log-secondary-foreground hover:bg-decision-log-secondary/80",
      },
      {
        variant: "secondary",
        domain: "personal-clarity",
        class: "bg-personal-clarity-secondary text-personal-clarity-secondary-foreground hover:bg-personal-clarity-secondary/80",
      },
      {
        variant: "link",
        domain: "thinking-desk",
        class: "text-thinking-desk-primary hover:text-thinking-desk-primary/80",
      },
      {
        variant: "link",
        domain: "offer-vault",
        class: "text-offer-vault-primary hover:text-offer-vault-primary/80",
      },
      {
        variant: "link",
        domain: "decision-log",
        class: "text-decision-log-primary hover:text-decision-log-primary/80",
      },
      {
        variant: "link",
        domain: "personal-clarity",
        class: "text-personal-clarity-primary hover:text-personal-clarity-primary/80",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      domain: "default",
    },
  }
);

/**
 * Button component with various styles and states
 * 
 * @example
 * ```tsx
 * <Button>Button Text</Button>
 * 
 * <Button 
 *   variant="outline" 
 *   size="sm" 
 *   onClick={handleClick}
 *   domain="offer-vault"
 * >
 *   Small Button
 * </Button>
 * 
 * <Button 
 *   leadingIcon={<PlusIcon size={16} />}
 *   trailingIcon={<ChevronRightIcon size={16} />}
 * >
 *   Button With Icons
 * </Button>
 * ```
 */
export function Button({
  className,
  variant,
  size,
  domain = "default",
  leadingIcon,
  trailingIcon,
  children,
  ...props
}) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, domain, className }))}
      {...props}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}