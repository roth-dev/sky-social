import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";
import { ATFeedItem } from "@/types/atproto";

export function useUnlikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ likeUri }: { likeUri: string }) => {
      if (!likeUri) {
        throw new Error("Invalid like URI");
      }
      const result = await atprotoClient.unlikePost(likeUri);
      if (!result.success) {
        throw new Error(result.error || "Failed to unlike post");
      }
      return result.data;
    },
    onMutate: async ({ likeUri }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.timeline });
      queryClient.setQueriesData(
        { queryKey: queryKeys.timeline },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              feed: page.feed.map((item: ATFeedItem) => {
                if (item.post.viewer?.like === likeUri) {
                  return {
                    ...item,
                    post: {
                      ...item.post,
                      likeCount: Math.max((item.post.likeCount || 0) - 1, 0),
                      viewer: {
                        ...item.post.viewer,
                        like: undefined,
                      },
                    },
                  };
                }
                return item;
              }),
            })),
          };
        }
      );
    },
    onSuccess: () => {
      // The optimistic update should be sufficient, but we can invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
