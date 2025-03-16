import React from 'react';
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

/**
 * Status badge with consistent styling based on status types
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = (): BadgeVariant => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes('completed') || 
        normalizedStatus.includes('active') || 
        normalizedStatus.includes('done')) {
      return 'default';
    }
    
    if (normalizedStatus.includes('pending') || 
        normalizedStatus.includes('in progress') || 
        normalizedStatus.includes('started')) {
      return 'outline';
    }
    
    if (normalizedStatus.includes('cancelled') || 
        normalizedStatus.includes('archived') ||
        normalizedStatus.includes('deleted')) {
      return 'destructive';
    }
    
    return 'secondary';
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={cn('capitalize', className)}
    >
      {status}
    </Badge>
  );
}

interface FeatureCardProps {
  title: string;
  description?: string;
  status?: string;
  date?: Date;
  metadata?: {
    label: string;
    value: string | number | React.ReactNode;
  }[];
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    icon?: React.ReactNode;
  }[];
  className?: string;
  children?: React.ReactNode;
}

/**
 * Unified card component for displaying items across different features
 */
export function FeatureCard({
  title,
  description,
  status,
  date,
  metadata,
  actions,
  className,
  children
}: FeatureCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
          {date && (
            <p className="text-sm text-muted-foreground">
              {date.toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          )}
        </div>
        {status && <StatusBadge status={status} />}
      </CardHeader>
      
      <CardContent>
        {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
        
        {metadata && metadata.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {metadata.map((item, index) => (
              <div key={index} className="space-y-1">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        )}
        
        {children}
      </CardContent>
      
      {actions && actions.length > 0 && (
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
      )}
    </Card>
  );
}