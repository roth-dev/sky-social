import { useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { atprotoClient } from "./atproto";
import { ATProfile, ATFeedItem, ATPost } from "@/types/atproto";
import { isVideoPost } from "@/utils/embedUtils";

// Query Keys
export const queryKeys = {
  timeline: ["timeline"] as const,
  profile: (handle: string) => ["profile", handle] as const,
  authorFeed: (handle: string) => ["authorFeed", handle] as const,
  actorLikes: (handle: string) => ["actorLikes", handle] as const,
  postThread: (uri: string) => ["postThread", uri] as const,
  search: (query: string) => ["search", query] as const,
  searchActors: (query: string) => ["searchActors", query] as const,
  searchPosts: (query: string) => ["searchPosts", query] as const,
  suggestedFollows: ["suggestedFollows"] as const,
  popularFeeds: ["popularFeeds"] as const,
  videoFeed: ["videoFeed"] as const,
} as const;

// Enhanced error handling for queries
const handleQueryError = (error: any) => {
  console.error("Query error:", error);

  // Don't retry on authentication errors - redirect to login instead
  if (
    error?.message?.includes("authentication") ||
    error?.message?.includes("401")
  ) {
    // This could trigger a logout/redirect to login
    return false;
  }

  // Don't retry on profile not found errors
  if (
    error?.message?.includes("Profile not found") ||
    error?.message?.includes("Actor not found") ||
    error?.status === 404
  ) {
    return false;
  }

  // Don't retry on invalid request errors
  if (error?.message?.includes("Invalid request") || error?.status === 400) {
    return false;
  }

  // Retry on network errors and server errors
  if (
    error?.message?.includes("UpstreamFailure") ||
    error?.message?.includes("network") ||
    error?.message?.includes("timeout") ||
    error?.status >= 500
  ) {
    return true;
  }

  // Default to retry for unknown errors
  return true;
};

// Helper function to validate handle format
const isValidHandle = (handle: string): boolean => {
  if (!handle || typeof handle !== "string") return false;

  // Handle should not be empty or just whitespace
  if (handle.trim().length === 0) return false;

  // Handle should not contain invalid characters for AT Protocol
  const validHandleRegex = /^[a-zA-Z0-9.-]+$/;
  return validHandleRegex.test(handle);
};

// Helper function to validate search query
const isValidSearchQuery = (query: string): boolean => {
  if (!query || typeof query !== "string") return false;
  return query.trim().length >= 1; // Minimum 1 character for search
};

// Timeline Queries - Now works for both authenticated and unauthenticated users
export function useTimeline() {
  return useInfiniteQuery({
    queryKey: queryKeys.timeline,
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.getTimeline(30, pageParam);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch timeline");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: true, // Always enabled now, not just for authenticated users
    retry: (failureCount, error) => {
      // Don't retry more than 3 times
      if (failureCount >= 3) return false;

      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// Video Feed Query - filters timeline for video posts
export function useVideoFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.videoFeed,
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.getTimeline(50, pageParam); // Get more posts to filter for videos
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch video feed");
      }
      
      // Filter for video posts only
      const videoFeed = result.data.feed.filter((item) => isVideoPost(item.post));
      
      return {
        ...result.data,
        feed: videoFeed,
      };
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: true,
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Search Queries
export function useSearchActors(query: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.searchActors(query),
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.searchActors(query, 25, pageParam);
      if (!result.success) {
        throw new Error(result.error || "Failed to search users");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    enabled: isValidSearchQuery(query),
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useSearchPosts(query: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.searchPosts(query),
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.searchPosts(query, 25, pageParam);
      if (!result.success) {
        throw new Error(result.error || "Failed to search posts");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: isValidSearchQuery(query),
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useSuggestedFollows(isAuthenticated: boolean = false) {
  return useQuery({
    queryKey: queryKeys.suggestedFollows,
    queryFn: async () => {
      const result = await atprotoClient.getSuggestedFollows();
      if (!result.success) {
        throw new Error(result.error || "Failed to get suggested follows");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: isAuthenticated, // Only run when authenticated
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function usePopularFeeds() {
  return useQuery({
    queryKey: queryKeys.popularFeeds,
    queryFn: async () => {
      const result = await atprotoClient.getPopularFeedGenerators();
      if (!result.success) {
        throw new Error(result.error || "Failed to get popular feeds");
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Profile Queries
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

export function useAuthorFeed(handle: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.authorFeed(handle),
    queryFn: async ({ pageParam }) => {
      if (!isValidHandle(handle)) {
        throw new Error("Invalid handle format");
      }

      const result = await atprotoClient.getAuthorFeed(handle, 30, pageParam);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch author feed");
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!handle && isValidHandle(handle),
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useActorLikes(handle: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.actorLikes(handle),
    queryFn: async ({ pageParam }) => {
      if (!isValidHandle(handle)) {
        throw new Error("Invalid handle format");
      }

      // Check if the profile exists first before trying to get likes
      const profileResult = await atprotoClient.getProfile(handle);
      if (!profileResult.success) {
        throw new Error(profileResult.error || "Profile not found");
      }

      const result = await atprotoClient.getActorLikes(handle, 30, pageParam);
      if (!result.success) {
        // If likes are not available, return empty feed instead of error
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
      if (failureCount >= 2) return false; // Reduce retries for likes
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Post Thread Query
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

// Mutations with enhanced error handling - require authentication
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
      // Invalidate and refetch timeline and author feed
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
      queryClient.invalidateQueries({ queryKey: queryKeys.videoFeed });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      text,
      parentUri,
      parentCid,
      rootUri,
      rootCid,
    }: {
      text: string;
      parentUri: string;
      parentCid: string;
      rootUri: string;
      rootCid: string;
    }) => {
      if (!text || text.trim().length === 0) {
        throw new Error("Reply text cannot be empty");
      }

      const result = await atprotoClient.createReply(
        text,
        parentUri,
        parentCid,
        rootUri,
        rootCid
      );
      if (!result.success) {
        throw new Error(result.error || "Failed to create reply");
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the post thread to show the new reply
      queryClient.invalidateQueries({
        queryKey: queryKeys.postThread(variables.rootUri),
      });
      // Also invalidate timeline
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uri, cid }: { uri: string; cid: string }) => {
      if (!uri || !cid) {
        throw new Error("Invalid post URI or CID");
      }

      const result = await atprotoClient.likePost(uri, cid);
      if (!result.success) {
        throw new Error(result.error || "Failed to like post");
      }
      return result.data;
    },
    onMutate: async ({ uri }) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: queryKeys.timeline });

      // Update timeline cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.timeline },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              feed: page.feed.map((item: ATFeedItem) => {
                if (item.post.uri === uri) {
                  return {
                    ...item,
                    post: {
                      ...item.post,
                      likeCount: (item.post.likeCount || 0) + 1,
                      viewer: { ...item.post.viewer, like: "temp-like-uri" },
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
    onError: (_, { uri }) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

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
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

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
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: queryKeys.timeline });

      // Update timeline cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.timeline },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
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
    onError: () => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useDeleteRepost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ repostUri }: { repostUri: string }) => {
      if (!repostUri) {
        throw new Error("Invalid repost URI");
      }

      const result = await atprotoClient.deleteRepost(repostUri);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete repost");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useFollowProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ did }: { did: string }) => {
      if (!did) {
        throw new Error("Invalid DID");
      }

      const result = await atprotoClient.followProfile(did);
      if (!result.success) {
        throw new Error(result.error || "Failed to follow profile");
      }
      return result.data;
    },
    onSuccess: (_, { did }) => {
      // Invalidate profile queries to update follow status
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestedFollows });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useUnfollowProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ followUri }: { followUri: string }) => {
      if (!followUri) {
        throw new Error("Invalid follow URI");
      }

      const result = await atprotoClient.unfollowProfile(followUri);
      if (!result.success) {
        throw new Error(result.error || "Failed to unfollow profile");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate profile queries to update follow status
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestedFollows });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Utility function to get media posts from author feed
export function useAuthorMediaFeed(handle: string) {
  const authorFeedQuery = useAuthorFeed(handle);

  const mediaFeed = useMemo(() => {
    if (!authorFeedQuery.data) return [];

    return authorFeedQuery.data.pages.flatMap((page) =>
      page?.feed.filter(
        (item) =>
          (item.post.embed?.images && item.post.embed.images.length > 0) ||
          isVideoPost(item.post)
      )
    );
  }, [authorFeedQuery.data]);

  return {
    ...authorFeedQuery,
    data: mediaFeed,
  };
}