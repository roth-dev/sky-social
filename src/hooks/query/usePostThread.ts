import { useQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";

export function usePostThread(uri: string) {
  return useQuery({
    queryKey: queryKeys.postThread(uri),
    queryFn: async () => {
      if (!uri || typeof uri !== "string" || uri.trim().length === 0) {
        throw new Error("Invalid post URI");
      }
      const result = await atprotoClient.getPostThread(uri);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch post thread");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!uri,
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
