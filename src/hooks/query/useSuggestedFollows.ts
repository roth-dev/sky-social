import { useQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError, retryDelay } from "@/lib/queries";

export function useSuggestedFollows(isAuthenticated: boolean = false) {
  return useQuery({
    queryKey: queryKeys.suggestedFollows,
    queryFn: async () => {
      const result = await atprotoClient.getSuggestedFollows();
      if (!result.success) {
        throw new Error(result.error || "Failed to get suggested follows");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: isAuthenticated, // Only run when authenticated
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay,
  });
}
