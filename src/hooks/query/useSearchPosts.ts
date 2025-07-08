import { useInfiniteQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import {
  queryKeys,
  handleQueryError,
  isValidSearchQuery,
  retryDelay,
} from "@/lib/queries";

export function useSearchPosts(query: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.searchPosts(query),
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.searchPosts(query, 25, pageParam);
      if (!result.success) {
        throw new Error(result.error || "Failed to search posts");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: isValidSearchQuery(query),
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay,
  });
}
