import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError, retryDelay } from "@/lib/queries";

export function useDeleteRepost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ repostUri }: { repostUri: string }) => {
      if (!repostUri) {
        throw new Error("Invalid repost URI");
      }
      const result = await atprotoClient.deleteRepost(repostUri);
      if (!result.success) {
        throw new Error((result as any).error || "Failed to delete repost");
      }
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay,
  });
}
