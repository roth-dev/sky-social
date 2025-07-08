import { useInfiniteQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError, isValidSearchQuery } from "@/lib/queries";

export function useSearchActors(query: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.searchActors(query),
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.searchActors(query, 25, pageParam);
      if (!result.success) {
        throw new Error(result.error || "Failed to search users");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    enabled: isValidSearchQuery(query),
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
