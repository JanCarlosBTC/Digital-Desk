import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "./error-utils";

interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: unknown;
}

async function apiRequest<T>(method: string, url: string, data?: unknown): Promise<T> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // Use the server's error message if available
      const errorMessage = responseData.message || responseData.error || response.statusText || 'Unknown Error';
      const error = new Error(`API Error: ${errorMessage}`);
      // Add response data and status to the error for more context
      (error as any).status = response.status;
      (error as any).data = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    // If error is already handled just rethrow
    if (error instanceof Error && (error as any).status) {
      throw error;
    }
    
    // Handle network errors or other unexpected issues
    const enhancedError = new Error(error instanceof Error ? error.message : 'Network error');
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }
}

export function useBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requests: ApiRequest[]) => {
      return await Promise.all(
        requests.map(req => apiRequest(req.method, req.url, req.data))
      );
    },
    onError: (error) => {
      console.error("Batch mutation error:", error);
    },
    onSettled: () => {
      // Invalidate affected queries
      queryClient.invalidateQueries();
    },
  });
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  method: ApiRequest['method'] = 'POST',
  options: {
    onSuccess?: (data: TData) => void;
    invalidateQueries?: string[];
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      return await apiRequest<TData>(method, url, variables);
    },
    onSuccess: (data) => {
      if (options.onSuccess) {
        options.onSuccess(data);
      }
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
    },
    onError: (error) => {
      console.error(`API Mutation error (${url}):`, error);
    }
  });
} 