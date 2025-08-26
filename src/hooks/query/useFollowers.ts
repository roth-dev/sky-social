import { useInfiniteQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { handleQueryError, retryDelay } from "@/lib/queries";
import { isValidHandle } from "@/utils/handleUtils";

export function useFollowers(handle: string) {
  return useInfiniteQuery({
    queryKey: ["followers", handle],
    queryFn: async ({ pageParam }) => {
      if (!isValidHandle(handle)) {
        throw new Error("Invalid handle format");
      }

      const result = await atprotoClient.getFollowers(handle, 30, pageParam);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch followers");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay,
    enabled: !!handle && isValidHandle(handle),
  });
}
