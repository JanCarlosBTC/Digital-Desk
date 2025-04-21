import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names or conditional class names into a single string,
 * then merges and resolves any Tailwind CSS conflicts.
 * 
 * @param inputs - Any number of class name strings, objects, or arrays
 * @returns A merged and normalized class name string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date according to the specified format
 * 
 * @param date - The date to format
 * @param format - The format string (default: "MMMM d, yyyy")
 * @returns A formatted date string
 */
export function formatDate(date?: Date, format: string = "MMMM d, yyyy"): string {
  if (!date) return "";
  
  // Simple formatting implementation
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Creates a type-safe domain color function generator
 * 
 * @param domain - The domain to get colors for
 * @returns An object with methods to get various domain colors
 */
export function getDomainColors(domain: "thinking-desk" | "offer-vault" | "decision-log" | "personal-clarity") {
  return {
    primary: `var(--${domain}-primary)`,
    secondary: `var(--${domain}-secondary)`,
    accent: `var(--${domain}-accent)`,
  };
}