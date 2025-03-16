import React from 'react';
import { Button } from './button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
  children?: React.ReactNode;
}

/**
 * Consistent page header component used across all app features
 * Provides a unified look and feel for section headers
 */
export function PageHeader({
  title,
  description,
  icon,
  action,
  className,
  children
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-3 mb-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="h-8 w-8 text-primary">{icon}</div>}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        
        {action && (
          <Button onClick={action.onClick}>
            {action.icon || <Plus className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>
      
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}

      {children}
    </div>
  );
}