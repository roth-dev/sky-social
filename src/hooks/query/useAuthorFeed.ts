import { useInfiniteQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";
import { isValidHandle } from "@/utils/handleUtils";

export function useAuthorFeed(handle: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.authorFeed(handle),
    queryFn: async ({ pageParam }) => {
      if (!isValidHandle(handle)) {
        throw new Error("Invalid handle format");
      }
      const result = await atprotoClient.getAuthorFeed(handle, 30, pageParam);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch author feed");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!handle && isValidHandle(handle),
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
