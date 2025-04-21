import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';
import { Loader2 } from 'lucide-react';

const panelVariants = cva(
  "rounded-lg border shadow-sm w-full overflow-hidden",
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

const headerVariants = cva(
  "flex items-center justify-between px-6 py-4 border-b",
  {
    variants: {
      domain: {
        "thinking-desk": "border-thinking-desk-primary/20 bg-thinking-desk-secondary/20",
        "offer-vault": "border-offer-vault-primary/20 bg-offer-vault-secondary/20",
        "decision-log": "border-decision-log-primary/20 bg-decision-log-secondary/20",
        "personal-clarity": "border-personal-clarity-primary/20 bg-personal-clarity-secondary/20",
        default: "border-border",
      },
    },
    defaultVariants: {
      domain: "default",
    },
  }
);

/**
 * Dashboard Panel component for creating consistent dashboard sections
 * 
 * @example
 * ```tsx
 * <DashboardPanel
 *   title="Weekly Reflections"
 *   description="Track your progress and insights"
 *   icon={<NotebookIcon />}
 *   domain="personal-clarity"
 *   actions={<Button variant="outline">New Reflection</Button>}
 * >
 *   Content goes here
 * </DashboardPanel>
 * ```
 */
export function DashboardPanel({
  title,
  description,
  icon,
  domain = "default",
  variant = "default",
  actions,
  children,
  isLoading = false,
  className,
  ...props
}) {
  const domainIconColor = {
    "thinking-desk": "text-thinking-desk-primary",
    "offer-vault": "text-offer-vault-primary",
    "decision-log": "text-decision-log-primary",
    "personal-clarity": "text-personal-clarity-primary",
    "default": "text-primary",
  }[domain];

  return (
    <div className={cn(panelVariants({ variant, domain, className }))} {...props}>
      <div className={cn(headerVariants({ domain }))}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn("flex-shrink-0", domainIconColor)}>
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-6 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : null}
        <div className={isLoading ? "opacity-50" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
}