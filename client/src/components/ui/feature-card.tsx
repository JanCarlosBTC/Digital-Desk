import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { VariantProps } from "class-variance-authority";
import { badgeVariants } from './badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

// Precomputed status mappings for better performance
const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  'completed': 'default',
  'active': 'default',
  'done': 'default',
  'pending': 'outline',
  'in progress': 'outline',
  'started': 'outline',
  'cancelled': 'destructive',
  'archived': 'destructive',
  'deleted': 'destructive'
};

/**
 * Status badge with consistent styling based on status types
 * Memoized for better performance
 */
export const StatusBadge = memo(({ status, className }: StatusBadgeProps) => {
  // Use a memoized variant calculation to prevent unnecessary re-renders
  const variant = useMemo<BadgeVariant>(() => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status.toLowerCase();
    
    // Check for exact matches first (faster)
    if (STATUS_VARIANTS[normalizedStatus]) {
      return STATUS_VARIANTS[normalizedStatus];
    }
    
    // Fall back to more expensive includes checks
    for (const [key, value] of Object.entries(STATUS_VARIANTS)) {
      if (normalizedStatus.includes(key)) {
        return value;
      }
    }
    
    return 'secondary';
  }, [status]);

  return (
    <Badge 
      variant={variant} 
      className={cn('capitalize', className)}
    >
      {status}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Type definitions with better organization
export interface MetadataItem {
  label: string;
  value: string | number | React.ReactNode;
}

export interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 
    'thinkingDesk' | 'thinkingDeskOutline' | 
    'personalClarity' | 'personalClarityOutline' | 
    'decisionLog' | 'decisionLogOutline' | 
    'offerVault' | 'offerVaultOutline';
  icon?: React.ReactNode;
}

export interface FeatureCardProps {
  title: string;
  description?: string;
  status?: string;
  date?: Date;
  metadata?: MetadataItem[];
  actions?: ActionItem[];
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;  // Added for clarity-lab.tsx compatibility
}

/**
 * Optimized card component for displaying items across different features
 * Performance improvements:
 * - Memoized components
 * - Optimized rendering logic
 * - Better typings
 */
export const FeatureCard = memo(({
  title,
  description,
  status,
  date,
  metadata,
  actions,
  className,
  children,
  icon
}: FeatureCardProps) => {
  // Format date only when needed
  const formattedDate = useMemo(() => {
    if (!date) return null;
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, [date]);

  // Render metadata items
  const metadataContent = useMemo(() => {
    if (!metadata?.length) return null;
    
    return (
      <div className="grid grid-cols-2 gap-3 mt-3">
        {metadata.map((item, index) => (
          <div key={index} className="space-y-1">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-medium">{item.value}</p>
          </div>
        ))}
      </div>
    );
  }, [metadata]);

  // Render action buttons
  const actionButtons = useMemo(() => {
    if (!actions?.length) return null;
    
    return (
      <CardFooter className="flex justify-end gap-2 pt-0">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'ghost'}
            size="sm"
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </CardFooter>
    );
  }, [actions]);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
          {formattedDate && (
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          )}
        </div>
        {status && <StatusBadge status={status} />}
      </CardHeader>
      
      <CardContent>
        {icon && (
          <div className="w-8 h-8 mb-2 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        {metadataContent}
        {children}
      </CardContent>
      
      {actionButtons}
    </Card>
  );
});

FeatureCard.displayName = 'FeatureCard';