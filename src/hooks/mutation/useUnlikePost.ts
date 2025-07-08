import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";

export function useUnlikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ likeUri }: { likeUri: string }) => {
      if (!likeUri) {
        throw new Error("Invalid like URI");
      }
      const result = await atprotoClient.unlikePost(likeUri);
      if (!result.success) {
        throw new Error((result as any).error || "Failed to unlike post");
      }
      return (result as any).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
