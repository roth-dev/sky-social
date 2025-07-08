import { useInfiniteQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError, retryDelay } from "@/lib/queries";
import { isValidHandle } from "@/utils/handleUtils";

export function useActorLikes(handle: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.actorLikes(handle),
    queryFn: async ({ pageParam }) => {
      if (!isValidHandle(handle)) {
        throw new Error("Invalid handle format");
      }
      const profileResult = await atprotoClient.getProfile(handle);
      if (!profileResult.success) {
        throw new Error(profileResult.error || "Profile not found");
      }
      const result = await atprotoClient.getActorLikes(handle, 30, pageParam);
      if (!result.success) {
        if (
          result.error?.includes("not found") ||
          result.error?.includes("not available") ||
          result.error?.includes("Invalid request")
        ) {
          return { feed: [], cursor: undefined };
        }
        throw new Error(result.error || "Failed to fetch actor likes");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 20, // 20 minutes
    enabled: !!handle && isValidHandle(handle),
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay,
  });
}
