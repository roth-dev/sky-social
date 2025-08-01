import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";
import { ATFeedItem } from "@/types/atproto";

export function useRepost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uri, cid }: { uri: string; cid: string }) => {
      if (!uri || !cid) {
        throw new Error("Invalid post URI or CID");
      }
      const result = await atprotoClient.repost(uri, cid);
      if (!result.success) {
        throw new Error(result.error || "Failed to repost");
      }
      return result.data;
    },
    onMutate: async ({ uri }) => {
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
                if (item.post.uri === uri) {
                  return {
                    ...item,
                    post: {
                      ...item.post,
                      repostCount: (item.post.repostCount || 0) + 1,
                      viewer: {
                        ...item.post.viewer,
                        repost: "temp-repost-uri",
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
    onSuccess: (data, { uri }) => {
      // Update the cache with the real repost URI from the response
      queryClient.setQueriesData(
        { queryKey: queryKeys.timeline },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              feed: page.feed.map((item: ATFeedItem) => {
                if (item.post.uri === uri) {
                  return {
                    ...item,
                    post: {
                      ...item.post,
                      viewer: {
                        ...item.post.viewer,
                        repost: data?.uri || "temp-repost-uri",
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
