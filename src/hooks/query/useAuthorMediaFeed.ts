import { useMemo } from "react";
import { useAuthorFeed } from "./useAuthorFeed";
import { isVideoPost } from "@/utils/embedUtils";

export function useAuthorMediaFeed(handle: string) {
  const authorFeedQuery = useAuthorFeed(handle);

  const mediaFeed = useMemo(() => {
    if (!authorFeedQuery.data) return [];
    return authorFeedQuery.data.pages.flatMap((page) =>
      page?.feed.filter(
        (item) =>
          (item.post.embed?.images &&
            Array.isArray(item.post.embed.images) &&
            item.post.embed.images.length > 0) ||
          isVideoPost(item.post)
      )
    );
  }, [authorFeedQuery.data]);

  return {
    ...authorFeedQuery,
    data: mediaFeed,
  };
}
