/**
 * Shared UI Components for Common State Patterns
 * 
 * This file contains reusable components for handling common UI states like:
 * - Loading states
 * - Empty states
 * - Error states
 * - Network error states
 * 
 * Using these components ensures consistency across the application
 * and reduces code duplication.
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LucideIcon, Loader2Icon, AlertTriangleIcon, RefreshCwIcon, AlertCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Info, Trash2, CheckCircle } from 'lucide-react';

/**
 * State handler components for common UI patterns
 * 
 * These components provide a consistent way to handle loading states,
 * empty states, error states, and confirmation dialogs across the application.
 */

// Props for the LoadingState component
export interface LoadingStateProps {
  className?: string;
  itemCount?: number;
  variant?: 'default' | 'card' | 'list';
}

// Props for the EmptyState component
export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode | 'tree' | 'info' | 'warning' | 'check';
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

// Props for the ErrorState component
export interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  variant?: 'default' | 'destructive';
  className?: string;
}

// Props for the DeleteConfirmationContent component
export interface DeleteConfirmationContentProps {
  title: string;
  description: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

/**
 * Loading State Component
 * 
 * Displays a skeleton loading state for various UI patterns
 */
export function LoadingState({ className, itemCount = 3, variant = 'default' }: LoadingStateProps) {
  // Render card skeletons
  if (variant === 'card') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }
  
  // Render list skeletons
  if (variant === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Default skeleton
  return (
    <div className={cn('w-full space-y-4', className)} aria-busy="true" aria-live="polite" role="status">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
      <div className="pt-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full mb-4" />
        ))}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 * 
 * Displays a message when no data is available
 */
export function EmptyState({ 
  title, 
  description, 
  icon, 
  action,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  // Render the appropriate icon
  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;
    
    switch (icon) {
      case 'tree':
        return <div className="rounded-full bg-primary/10 p-3"><Info className="h-6 w-6 text-primary" /></div>;
      case 'warning':
        return <div className="rounded-full bg-warning/10 p-3"><AlertTriangleIcon className="h-6 w-6 text-warning" /></div>;
      case 'check':
        return <div className="rounded-full bg-success/10 p-3"><CheckCircleIcon className="h-6 w-6 text-success" /></div>;
      case 'info':
      default:
        return <div className="rounded-full bg-muted p-3"><Info className="h-6 w-6 text-muted-foreground" /></div>;
    }
  };
  
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed', className)}>
      {icon && (
        <div className="mb-4">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-lg font-semibold mt-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mt-1 mb-4">{description}</p>
      
      {action ? (
        action
      ) : actionLabel && onAction ? (
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </div>
  );
}

/**
 * Error State Component
 * 
 * Displays an error message with retry option
 */
export function ErrorState({ 
  title, 
  message, 
  onRetry, 
  variant = 'destructive',
  className 
}: ErrorStateProps) {
  return (
    <Alert variant={variant} className={cn('', className)}>
      <AlertTriangleIcon className="h-4 w-4 mr-2" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="mt-2"
        >
          <RefreshCwIcon className="h-3 w-3 mr-2" />
          Try Again
        </Button>
      )}
    </Alert>
  );
}

/**
 * Network Error Component
 * 
 * Displays a network-specific error message
 */
export function NetworkError({ message, onRetry }: { message: string, onRetry?: () => void }) {
  return (
    <ErrorState
      title="Network Error"
      message={message}
      onRetry={onRetry}
      variant="destructive"
    />
  );
}

/**
 * Cards Skeleton Component
 * 
 * Displays a skeleton loading state specifically for card layouts
 */
export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return <LoadingState itemCount={count} variant="card" />;
}

/**
 * Delete Confirmation Content Component
 * 
 * Content for a dialog to confirm deletion
 */
export function DeleteConfirmationContent({
  title,
  description,
  itemName,
  onConfirm,
  onCancel,
  isDeleting = false
}: DeleteConfirmationContentProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-3">
        <div className="bg-destructive/10 p-2 rounded-full">
          <Trash2 className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {itemName && (
            <p className="text-sm font-medium mt-1">"{itemName}"</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <span className="animate-spin mr-2">●</span>
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </div>
    </div>
  );
}

export default {
  LoadingState,
  EmptyState,
  ErrorState,
  NetworkError,
  CardsSkeleton,
  DeleteConfirmationContent,
}; 