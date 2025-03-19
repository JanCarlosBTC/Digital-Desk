import { useToast } from "@/components/ui/use-toast";
import { useCallback } from "react";

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}

export function useErrorHandler() {
  const { toast } = useToast();
  
  return useCallback((error: unknown, title = "Error") => {
    const message = extractErrorMessage(error);
    toast({
      title,
      description: message,
      variant: "destructive"
    });
    // Log error for monitoring
    console.error('[Error]:', { title, message, error });
  }, [toast]);
}

export function handleApiError(error: unknown): never {
  const message = extractErrorMessage(error);
  throw new Error(`API Error: ${message}`);
} 