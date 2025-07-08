import { useQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";

export function usePopularFeeds() {
  return useQuery({
    queryKey: queryKeys.popularFeeds,
    queryFn: async () => {
      const result = await atprotoClient.getPopularFeedGenerators();
      if (!result.success) {
        throw new Error(result.error || "Failed to get popular feeds");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
