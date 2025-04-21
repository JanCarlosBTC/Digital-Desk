import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../molecules/card.js";

export const dashboardPanelVariants = cva(
  "",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
        ghost: "",
      },
      size: {
        default: "",
        sm: "max-w-md",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "w-full",
      },
      domain: {
        "thinking-desk": "",
        "offer-vault": "",
        "decision-log": "",
        "personal-clarity": "",
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      domain: "default",
    },
  }
);

export interface DashboardPanelProps
  extends Omit<React.ComponentProps<typeof Card>, "variant" | "size">,
    VariantProps<typeof dashboardPanelVariants> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * Dashboard Panel component 
 * 
 * A high-level component for displaying data in a dashboard.
 * 
 * @example
 * ```tsx
 * <DashboardPanel
 *   title="Recent Activity"
 *   description="Your activity from the past 7 days"
 *   icon={<ActivityIcon />}
 *   actions={<Button>View All</Button>}
 *   domain="thinking-desk"
 * >
 *   <ActivityList items={activities} />
 * </DashboardPanel>
 * ```
 */
const DashboardPanel = React.forwardRef<HTMLDivElement, DashboardPanelProps>(
  ({
    className,
    variant = "default",
    size,
    domain,
    title,
    description,
    icon,
    actions,
    footer,
    isLoading = false,
    children,
    ...props
  }, ref) => {
    // Map dashboard panel variants to card variants
    const cardVariantMap = {
      default: "default",
      outline: "outline",
      ghost: "ghost",
    } as const;

    const domainCardMap = domain && domain !== "default" 
      ? domain 
      : "default";

    return (
      <Card
        ref={ref}
        variant={cardVariantMap[variant || "default"]}
        domain={domainCardMap}
        className={cn(
          dashboardPanelVariants({ variant, size, domain }),
          className
        )}
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-row items-center gap-2">
            {icon && (
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                domain === "thinking-desk" && "bg-thinking-desk-primary/10 text-thinking-desk-primary",
                domain === "offer-vault" && "bg-offer-vault-primary/10 text-offer-vault-primary",
                domain === "decision-log" && "bg-decision-log-primary/10 text-decision-log-primary",
                domain === "personal-clarity" && "bg-personal-clarity-primary/10 text-personal-clarity-primary",
                !domain || domain === "default" && "bg-primary/10 text-primary"
              )}>
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
          </div>
          {actions && <div className="flex flex-row gap-2">{actions}</div>}
        </CardHeader>
        <CardContent className={isLoading ? "animate-pulse" : ""}>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-8 w-full rounded-md bg-muted"></div>
              <div className="h-8 w-3/4 rounded-md bg-muted"></div>
              <div className="h-8 w-1/2 rounded-md bg-muted"></div>
            </div>
          ) : (
            children
          )}
        </CardContent>
        {footer && (
          <div className="border-t bg-muted/10 p-3 text-sm">{footer}</div>
        )}
      </Card>
    );
  }
);

DashboardPanel.displayName = "DashboardPanel";

export { DashboardPanel };