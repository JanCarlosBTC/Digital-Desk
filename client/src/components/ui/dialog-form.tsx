import React, { useRef, useEffect } from 'react';
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

  // Create a ref for the form to prevent default submission behavior
  const formRef = useRef<HTMLFormElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle form submission to prevent default browser behavior
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  // Prevent Enter key from submitting form unless in a multiline textarea
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && 
        !(e.target instanceof HTMLTextAreaElement) &&
        e.target instanceof HTMLInputElement) {
      e.stopPropagation();
    }
  };

  // Reset scroll position when opening or after state changes
  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          sizeClasses[size],
          'bg-white border-2',
          className
        )}
        // Prevent closing when clicking inside form elements
        onInteractOutside={(e) => {
          if (formRef.current?.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <form 
          ref={formRef} 
          onSubmit={handleSubmit} 
          className="flex flex-col h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader className="pb-2 sticky top-0 bg-white z-10">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-sm mt-1">{description}</DialogDescription>
            )}
          </DialogHeader>
          
          <div 
            ref={contentRef}
            className="py-4 overflow-y-auto flex-1 max-h-[50vh] md:max-h-[60vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
          
          <DialogFooter className="pt-4 sticky bottom-0 bg-white z-10 border-t mt-2">
            {footerContent && (
              <div className="w-full mb-4">
                {footerContent}
              </div>
            )}
            
            <div className="flex gap-2 items-center justify-end w-full">
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