import React from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /**
   * Loading state variant
   * - skeleton: Shows skeleton placeholders (for initial loading)
   * - spinner: Shows a spinner (for action loading)
   * - pulse: Shows a pulsing element (for background loading)
   */
  variant?: "skeleton" | "spinner" | "pulse";
  
  /**
   * Text to display below the loading indicator
   */
  text?: string;
  
  /**
   * CSS classes to apply to the container
   */
  className?: string;
  
  /**
   * Number of skeleton items to show (only for skeleton variant)
   */
  count?: number;
  
  /**
   * Height of each skeleton item (only for skeleton variant)
   */
  height?: string;

  /**
   * Whether loading is in progress
   */
  isLoading?: boolean;

  /**
   * Content to show when not loading
   */
  children?: React.ReactNode;
}

/**
 * LoadingState component for consistent loading UIs across the application
 */
export function LoadingState({
  variant = "skeleton",
  text,
  className,
  count = 3,
  height = "h-16",
  isLoading = true,
  children
}: LoadingStateProps) {
  // If we're not loading and have children, show the children
  if (!isLoading && children) {
    return <>{children}</>;
  }
  
  return (
    <div className={cn("w-full flex flex-col items-center justify-center py-8", className)}>
      {variant === "skeleton" && (
        <div className="w-full space-y-3">
          {Array(count).fill(0).map((_, i) => (
            <Skeleton 
              key={i} 
              className={cn("w-full", height)} 
            />
          ))}
        </div>
      )}
      
      {variant === "spinner" && (
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      )}
      
      {variant === "pulse" && (
        <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse" />
      )}
      
      {text && (
        <p className="text-sm text-muted-foreground mt-4">{text}</p>
      )}
    </div>
  );
}

/**
 * Card-specific loading state for consistent loading UIs in card components
 */
export function CardLoadingState({
  isLoading = true,
  children,
  className
}: {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!isLoading) {
    return <>{children}</>;
  }
  
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

/**
 * Table-specific loading state for consistent loading UIs in table components
 */
export function TableLoadingState({
  rowCount = 5,
  columnCount = 4,
  className
}: {
  rowCount?: number;
  columnCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex gap-4">
          {Array(columnCount).fill(0).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-8 flex-1" />
          ))}
        </div>
        
        {/* Data rows */}
        {Array(rowCount).fill(0).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4">
            {Array(columnCount).fill(0).map((_, colIndex) => (
              <Skeleton 
                key={`cell-${rowIndex}-${colIndex}`} 
                className="h-12 flex-1" 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 