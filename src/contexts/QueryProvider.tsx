import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { retryDelay } from "@/lib/queries";

function retry(failureCount: number, error: any) {
  if (
    error?.message?.includes("authentication") ||
    error?.message?.includes("unauthorized") ||
    error?.status === 401
  ) {
    return false;
  }

  if (
    error?.status >= 400 &&
    error?.status < 500 &&
    error?.status !== 408 &&
    error?.status !== 429
  ) {
    return false;
  }

  if (failureCount < 3) {
    if (
      error?.message?.includes("UpstreamFailure") ||
      error?.message?.includes("network") ||
      error?.message?.includes("timeout") ||
      error?.status >= 500
    ) {
      return true;
    }
  }

  return false;
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry,
      retryDelay,

      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 30, // 30 minutes default (formerly cacheTime)
      refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
      refetchOnReconnect: true, // Refetch when network reconnects
    },
    mutations: {
      retryDelay,
    },
  },
});

// Add global error handler
queryClient.setMutationDefaults(["mutation"], {
  onError: (error: any) => {
    // Handle authentication errors globally
    if (error?.message?.includes("authentication") || error?.status === 401) {
      // Could trigger a global logout here
      console.warn("Authentication error detected, user may need to re-login");
    }
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export { queryClient };
