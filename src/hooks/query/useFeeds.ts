import { atprotoClient, FeedDescriptor } from "@/lib/atproto";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useFeeds(feed: FeedDescriptor, limit: number = 30) {
  return useInfiniteQuery({
    queryKey: ["feed", feed],
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.getFeedByDescriptor(
        feed,
        limit,
        pageParam
      );
      if (!result.success && !result.data) {
        throw new Error(result.error || "Failed to fetch feed");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    enabled: true,
    retry: (failureCount) => {
      if (failureCount >= 3) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
