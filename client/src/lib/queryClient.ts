import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Throws an error for non-successful HTTP responses
 * @param res Response object to check
 * @throws Error with status code and response text
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Enhanced API request function that parses JSON responses
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param url API endpoint URL
 * @param data Optional request body data
 * @returns Parsed JSON response of type T
 */
export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Handle 204 No Content responses
  if (res.status === 204) {
    return {} as T;
  }
  
  // For other response types, parse JSON
  return await res.json() as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Creates a query function for React Query that handles unauthorized responses
 * @param options Configuration options for the query function 
 * @returns A query function to be used with useQuery
 */
export const getQueryFn = <TQueryFnData>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<TQueryFnData> =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null as unknown as TQueryFnData;
    }

    await throwIfResNotOk(res);
    
    // Handle 204 No Content responses
    if (res.status === 204) {
      return {} as TQueryFnData;
    }
    
    return await res.json() as TQueryFnData;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn<unknown>({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Changed to true to refresh data when window gets focus
      staleTime: 5 * 60 * 1000, // Set stale time to 5 minutes instead of infinity
      retry: 1, // Allow one retry
    },
    mutations: {
      retry: 1, // Allow one retry for mutations
    },
  },
});
