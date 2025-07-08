import { useInfiniteQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";
import { isVideoPost, createMockVideoPost } from "@/utils/embedUtils";

export function useVideoFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.videoFeed,
    queryFn: async ({ pageParam }) => {
      try {
        const result = await atprotoClient.getTimeline(50, pageParam);

        const videoFeed = result.data.feed.filter((item) =>
          isVideoPost(item.post)
        );
        if (videoFeed.length === 0) {
          const mockVideoFeed = Array.from({ length: 10 }, (_, index) =>
            createMockVideoPost(index + (pageParam ? parseInt(pageParam) : 0))
          );
          return {
            feed: mockVideoFeed,
            cursor: pageParam ? `${parseInt(pageParam) + 10}` : "10",
          };
        }
        return {
          ...result.data,
          feed: videoFeed,
        };
      } catch (error) {
        console.warn("Video feed API failed, using mock data:", error);
        const mockVideoFeed = Array.from({ length: 10 }, (_, index) =>
          createMockVideoPost(index + (pageParam ? parseInt(pageParam) : 0))
        );
        return {
          feed: mockVideoFeed,
          cursor: pageParam ? `${parseInt(pageParam) + 10}` : "10",
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: true,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
