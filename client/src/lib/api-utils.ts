import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "./error-utils";

interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: unknown;
}

async function apiRequest<T>(method: string, url: string, data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export function useBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requests: ApiRequest[]) => {
      try {
        return await Promise.all(
          requests.map(req => apiRequest(req.method, req.url, req.data))
        );
      } catch (error) {
        handleApiError(error);
        throw error;
      }
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
      try {
        return await apiRequest<TData>(method, url, variables);
      } catch (error) {
        handleApiError(error);
        throw error;
      }
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
  });
} 