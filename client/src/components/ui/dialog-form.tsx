import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './dialog';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface DialogFormProps {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footerContent?: React.ReactNode;
}

/**
 * Unified dialog form component for consistent form presentation
 */
export function DialogForm({
  title,
  description,
  open,
  onOpenChange,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  isDisabled = false,
  children,
  className,
  size = 'md',
  footerContent
}: DialogFormProps) {
  // Define width classes based on size
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-screen-md'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
          sizeClasses[size],
          className
        )}
      >
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          
          <div className="dialog-form-content py-4">
            {children}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            {footerContent}
            
            <div className="flex gap-2 items-center justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {cancelLabel}
              </Button>
              
              {onSubmit && (
                <Button 
                  type="submit"
                  disabled={isSubmitting || isDisabled}
                >
                  {isSubmitting ? 'Saving...' : submitLabel}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}