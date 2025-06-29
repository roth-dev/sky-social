import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { atprotoClient } from './atproto';
import { ATProfile, ATFeedItem, ATPost } from '@/types/atproto';

// Query Keys
export const queryKeys = {
  timeline: ['timeline'] as const,
  profile: (handle: string) => ['profile', handle] as const,
  authorFeed: (handle: string) => ['authorFeed', handle] as const,
  actorLikes: (handle: string) => ['actorLikes', handle] as const,
  postThread: (uri: string) => ['postThread', uri] as const,
  search: (query: string) => ['search', query] as const,
} as const;

// Timeline Queries
export function useTimeline() {
  return useInfiniteQuery({
    queryKey: queryKeys.timeline,
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.getTimeline(30, pageParam);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch timeline');
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: atprotoClient.getIsAuthenticated(),
  });
}

// Profile Queries
export function useProfile(handle: string) {
  return useQuery({
    queryKey: queryKeys.profile(handle),
    queryFn: async () => {
      const result = await atprotoClient.getProfile(handle);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch profile');
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!handle,
  });
}

export function useAuthorFeed(handle: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.authorFeed(handle),
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.getAuthorFeed(handle, 30, pageParam);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch author feed');
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!handle,
  });
}

export function useActorLikes(handle: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.actorLikes(handle),
    queryFn: async ({ pageParam }) => {
      const result = await atprotoClient.getActorLikes(handle, 30, pageParam);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch actor likes');
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 20, // 20 minutes
    enabled: !!handle,
  });
}

// Post Thread Query
export function usePostThread(uri: string) {
  return useQuery({
    queryKey: queryKeys.postThread(uri),
    queryFn: async () => {
      const result = await atprotoClient.getPostThread(uri);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch post thread');
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!uri,
  });
}

// Mutations
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ text, images }: { text: string; images?: any[] }) => {
      const result = await atprotoClient.createPost(text, images);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create post');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch timeline and author feed
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
      // We could also invalidate the current user's author feed if we have their handle
    },
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
      rootCid 
    }: { 
      text: string; 
      parentUri: string; 
      parentCid: string; 
      rootUri: string; 
      rootCid: string; 
    }) => {
      const result = await atprotoClient.createReply(text, parentUri, parentCid, rootUri, rootCid);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create reply');
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the post thread to show the new reply
      queryClient.invalidateQueries({ queryKey: queryKeys.postThread(variables.rootUri) });
      // Also invalidate timeline
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ uri, cid }: { uri: string; cid: string }) => {
      const result = await atprotoClient.likePost(uri, cid);
      if (!result.success) {
        throw new Error(result.error || 'Failed to like post');
      }
      return result.data;
    },
    onMutate: async ({ uri }) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: queryKeys.timeline });
      
      // Update timeline cache
      queryClient.setQueriesData({ queryKey: queryKeys.timeline }, (oldData: any) => {
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
                    viewer: { ...item.post.viewer, like: 'temp-like-uri' }
                  }
                };
              }
              return item;
            })
          }))
        };
      });
    },
    onError: (_, { uri }) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
  });
}

export function useUnlikePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ likeUri }: { likeUri: string }) => {
      const result = await atprotoClient.unlikePost(likeUri);
      if (!result.success) {
        throw new Error(result.error || 'Failed to unlike post');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
  });
}

export function useRepost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ uri, cid }: { uri: string; cid: string }) => {
      const result = await atprotoClient.repost(uri, cid);
      if (!result.success) {
        throw new Error(result.error || 'Failed to repost');
      }
      return result.data;
    },
    onMutate: async ({ uri }) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: queryKeys.timeline });
      
      // Update timeline cache
      queryClient.setQueriesData({ queryKey: queryKeys.timeline }, (oldData: any) => {
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
                    viewer: { ...item.post.viewer, repost: 'temp-repost-uri' }
                  }
                };
              }
              return item;
            })
          }))
        };
      });
    },
    onError: () => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
  });
}

export function useDeleteRepost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ repostUri }: { repostUri: string }) => {
      const result = await atprotoClient.deleteRepost(repostUri);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete repost');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
  });
}

export function useFollowProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ did }: { did: string }) => {
      const result = await atprotoClient.followProfile(did);
      if (!result.success) {
        throw new Error(result.error || 'Failed to follow profile');
      }
      return result.data;
    },
    onSuccess: (_, { did }) => {
      // Invalidate profile queries to update follow status
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUnfollowProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ followUri }: { followUri: string }) => {
      const result = await atprotoClient.unfollowProfile(followUri);
      if (!result.success) {
        throw new Error(result.error || 'Failed to unfollow profile');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate profile queries to update follow status
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Utility function to get media posts from author feed
export function useAuthorMediaFeed(handle: string) {
  const authorFeedQuery = useAuthorFeed(handle);
  
  const mediaFeed = React.useMemo(() => {
    if (!authorFeedQuery.data) return [];
    
    return authorFeedQuery.data.pages.flatMap(page => 
      page.feed.filter(item => 
        item.post.embed?.images && item.post.embed.images.length > 0
      )
    );
  }, [authorFeedQuery.data]);
  
  return {
    ...authorFeedQuery,
    data: mediaFeed,
  };
}