import { useInfiniteQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";
import { ATFeedItem } from "@/types/atproto";

interface TimelinePage {
  feed: ATFeedItem[];
  cursor?: string;
}

export function useTimeline() {
  return useInfiniteQuery({
    queryKey: queryKeys.timeline,
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.getTimeline(30, pageParam);
      if (!result.success) {
        throw new Error((result as any).error || "Failed to fetch timeline");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: true, // Always enabled now, not just for authenticated users
    retry: (failureCount, error) => {
      // Don't retry more than 3 times
      if (failureCount >= 3) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
