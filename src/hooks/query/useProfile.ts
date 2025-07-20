import { useQuery } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";
import { isValidHandle } from "@/utils/handleUtils";

export function useProfile(handle: string) {
  return useQuery({
    queryKey: queryKeys.profile(handle),
    queryFn: async () => {
      if (!isValidHandle(handle)) {
        throw new Error("Invalid handle format");
      }
      const result = await atprotoClient.getProfile(handle);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch profile");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!handle && isValidHandle(handle),
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
