/**
 * API Resource Hook
 * 
 * A general-purpose hook for handling API resources with React Query.
 * Provides standardized error handling, loading states, and optimistic updates.
 */

import { 
  useQuery, 
  useMutation, 
  UseMutationOptions, 
  UseQueryOptions,
  QueryClient,
  useQueryClient
} from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from './use-toast';

// Standard API error type
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Options for the API resource hook
export interface ApiResourceOptions<TData, TVariables> {
  // Query options
  queryOptions?: Omit<UseQueryOptions<TData, ApiError, TData>, 'queryKey' | 'queryFn'>;
  
  // Mutation options
  mutationOptions?: Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'>;
  
  // Fetch options for the request
  fetchOptions?: RequestInit;
  
  // Custom fetch function
  customFetch?: (url: string, options?: RequestInit) => Promise<TData>;
  
  // Function to transform the data before returning
  transform?: (data: any) => TData;
  
  // Optimistic update function
  optimisticUpdate?: (client: QueryClient, variables: TVariables) => void;
  
  // Initial data
  initialData?: TData;
}

// Response from the API resource hook for queries
export interface ApiQueryResponse<TData> {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  error?: ApiError | null;  // Updated to allow null values
  networkError: string | null;
  clearNetworkError: () => void;
  refetch: () => Promise<unknown>;
}

// Response from the API resource hook for mutations
export interface ApiMutationResponse<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error?: ApiError | null;  // Updated to allow null values
  resetError: () => void;
}

// Complete response from the API resource hook
export interface ApiResponse<TData, TVariables> {
  query: ApiQueryResponse<TData>;
  mutation: ApiMutationResponse<TData, TVariables>;
}

/**
 * Default fetch function that handles errors and JSON responses
 */
async function defaultFetch(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error: ApiError = {
      message: `Request failed with status ${response.status}`,
      status: response.status,
    };

    try {
      const errorJson = await response.json();
      error.message = errorJson.message || error.message;
      error.code = errorJson.code;
    } catch (e) {
      // If we can't parse the error as JSON, use the original error
    }

    throw error;
  }

  return response.json();
}

/**
 * Hook for working with API resources
 */
export function useApiResource<TData, TVariables = unknown>(
  url: string,
  queryKey: string[],
  options: ApiResourceOptions<TData, TVariables> = {}
): ApiResponse<TData, TVariables> {
  // Extract options with defaults
  const {
    queryOptions = {},
    mutationOptions = {},
    fetchOptions = {},
    customFetch,
    transform,
    optimisticUpdate,
    initialData,
  } = options;

  // Set up state for network errors
  const [networkError, setNetworkError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to clear network errors
  const clearNetworkError = () => setNetworkError(null);

  // Set up the query
  const query = useQuery<TData, ApiError, TData>({
    queryKey,
    queryFn: async () => {
      try {
        const fetchFn = customFetch || defaultFetch;
        const data = await fetchFn(url, fetchOptions);
        clearNetworkError();
        return transform ? transform(data) : data;
      } catch (error) {
        const apiError = error as ApiError;
        setNetworkError(apiError.message);
        throw apiError;
      }
    },
    initialData,
    ...queryOptions,
    retry: queryOptions.retry ?? 1,
    refetchOnWindowFocus: queryOptions.refetchOnWindowFocus ?? false,
  });

  // Set up the mutation
  const mutation = useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      try {
        // For URL patterns with placeholders like /api/items/:id
        let resolvedUrl = url;
        if (typeof variables === 'string' && url.includes(':id')) {
          resolvedUrl = url.replace(':id', variables);
        }

        const fetchFn = customFetch || defaultFetch;
        
        // Handle different variable types for POST/PUT vs DELETE
        const finalOptions = {
          ...fetchOptions,
          method: fetchOptions.method || 'POST',
          ...(typeof variables !== 'string' && variables
            ? { body: JSON.stringify(variables) }
            : {}),
        };

        const data = await fetchFn(resolvedUrl, finalOptions);
        return transform ? transform(data) : data;
      } catch (error) {
        const apiError = error as ApiError;
        
        // Show a toast for failed mutations by default
        toast({
          title: "Error",
          description: apiError.message,
          variant: "destructive",
        });
        
        throw apiError;
      }
    },
    ...mutationOptions,
    onMutate: async (variables) => {
      // If there's an optimistic update function, call it
      if (optimisticUpdate && queryClient) {
        optimisticUpdate(queryClient, variables);
      }
      
      // Call the original onMutate if it exists
      if (mutationOptions.onMutate) {
        return mutationOptions.onMutate(variables);
      }
      
      // Ensure a return value on all code paths
      return Promise.resolve(undefined);
    },
  });

  return {
    query: {
      data: query.data,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error || null, // Explicitly convert undefined to null
      networkError,
      clearNetworkError,
      refetch: query.refetch,
    },
    mutation: {
      mutate: mutation.mutate,
      mutateAsync: mutation.mutateAsync,
      isLoading: mutation.isPending,
      error: mutation.error || null, // Explicitly convert undefined to null
      resetError: mutation.reset,
    },
  };
}

export default useApiResource; 