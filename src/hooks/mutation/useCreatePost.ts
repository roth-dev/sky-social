import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError, retryDelay } from "@/lib/queries";

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ text, images }: { text: string; images?: any[] }) => {
      if (!text || text.trim().length === 0) {
        throw new Error("Post text cannot be empty");
      }
      const result = await atprotoClient.createPost(text, images);
      if (!result.success) {
        throw new Error(result.error || "Failed to create post");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
      queryClient.invalidateQueries({ queryKey: queryKeys.videoFeed });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay,
  });
}
