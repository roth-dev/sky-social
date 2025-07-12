import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError, retryDelay } from "@/lib/queries";
import { ATFeedItem } from "@/types/atproto";

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
    onMutate: async ({ repostUri }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.timeline });
      queryClient.setQueriesData(
        { queryKey: queryKeys.timeline },
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              feed: page.feed.map((item: ATFeedItem) => {
                if (item.post.viewer?.repost === repostUri) {
                  return {
                    ...item,
                    post: {
                      ...item.post,
                      repostCount: Math.max(
                        (item.post.repostCount || 0) - 1,
                        0
                      ),
                      viewer: {
                        ...item.post.viewer,
                        repost: undefined,
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
    retryDelay,
  });
}
