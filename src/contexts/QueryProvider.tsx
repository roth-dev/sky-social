import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { retryDelay } from "@/lib/queries";
import { atprotoClient } from "@/lib/atproto";

// Global flag to prevent multiple logout calls
let isGlobalLogoutTriggered = false;

function retry(failureCount: number, error: unknown) {
  const err = error as { status?: number; message?: string };

  if (
    err?.message?.includes("authentication") ||
    err?.message?.includes("unauthorized") ||
    err?.status === 401
  ) {
    return false;
  }

  if (
    err?.status !== undefined &&
    err.status >= 400 &&
    err.status < 500 &&
    err.status !== 408 &&
    err.status !== 429
  ) {
    return false;
  }

  if (failureCount < 3) {
    if (
      err?.message?.includes("UpstreamFailure") ||
      err?.message?.includes("network") ||
      err?.message?.includes("timeout") ||
      (err?.status !== undefined && err.status >= 500)
    ) {
      return true;
    }
  }

  return false;
}

// Enhanced global auth error handler
const handleGlobalAuthError = async (error: unknown) => {
  const err = error as { status?: number; message?: string };

  if (
    (err?.message?.includes("authentication") ||
      err?.message?.includes("unauthorized") ||
      err?.status === 401) &&
    !isGlobalLogoutTriggered
  ) {
    isGlobalLogoutTriggered = true;

    console.warn(
      "Global authentication error detected:",
      err?.message || error
    );

    // Try to refresh session first
    if (atprotoClient.getIsAuthenticated()) {
      console.log("Attempting to refresh session due to auth error...");
      const refreshed = await atprotoClient.performSessionRefresh();

      if (refreshed) {
        console.log("Session refreshed successfully after auth error");
        isGlobalLogoutTriggered = false;
        return;
      }
    }

    // If refresh failed, trigger logout
    console.warn("Session refresh failed, triggering logout");
    setTimeout(async () => {
      try {
        await atprotoClient.logout();
        // Redirect to login - this should be handled by the auth context
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } catch (logoutError) {
        console.error("Failed to logout after auth error:", logoutError);
      } finally {
        isGlobalLogoutTriggered = false;
      }
    }, 100);
  }
};

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

// Add global error handler for mutations
queryClient.setMutationDefaults(["mutation"], {
  onError: handleGlobalAuthError,
});

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export { queryClient };
