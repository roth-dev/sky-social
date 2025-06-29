import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client with enhanced error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (
          error?.message?.includes("authentication") ||
          error?.message?.includes("unauthorized") ||
          error?.status === 401
        ) {
          return false;
        }

        // Don't retry on client errors (4xx except 401, 408, 429)
        if (
          error?.status >= 400 &&
          error?.status < 500 &&
          error?.status !== 408 &&
          error?.status !== 429
        ) {
          return false;
        }

        // Retry up to 3 times for server errors and network issues
        if (failureCount < 3) {
          // Retry on UpstreamFailure and server errors
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
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff with jitter
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
        const jitter = Math.random() * 1000;
        return baseDelay + jitter;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 30, // 30 minutes default (formerly cacheTime)
      refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
      refetchOnReconnect: true, // Refetch when network reconnects
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry authentication errors
        if (
          error?.message?.includes("authentication") ||
          error?.status === 401
        ) {
          return false;
        }

        // Retry mutations once on network/server errors
        if (failureCount < 1) {
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
      },
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * 2 ** attemptIndex, 10000);
      },
    },
  },
});

// Add global error handler
queryClient.setMutationDefaults(["mutation"], {
  onError: (error: any) => {
    console.error("Mutation error:", error);

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
