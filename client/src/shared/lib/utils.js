import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes safely with conditional logic
 * 
 * @example
 * ```tsx
 * // Combining classes with conditional values
 * <div className={cn(
 *   "base-class", 
 *   isActive && "active-class",
 *   size === "large" ? "text-lg" : "text-sm"
 * )}>
 *   Content
 * </div>
 * ```
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}