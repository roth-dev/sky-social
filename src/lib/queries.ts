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
export const handleQueryError = (error: Error) => {
  if (
    error?.message?.includes("authentication") ||
    error?.message?.includes("401")
  ) {
    return false;
  }

  if (
    error?.message?.includes("Profile not found") ||
    error?.message?.includes("Actor not found")
  ) {
    return false;
  }

  if (error?.message?.includes("Invalid request")) {
    return false;
  }

  if (
    error?.message?.includes("UpstreamFailure") ||
    error?.message?.includes("network") ||
    error?.message?.includes("timeout")
  ) {
    return true;
  }

  return true;
};

export const isValidSearchQuery = (query: string): boolean => {
  if (!query || typeof query !== "string") return false;
  return query.trim().length >= 1; // Minimum 1 character for search
};

export const retryDelay = (attemptIndex: number) =>
  Math.min(1000 * 2 ** attemptIndex, 10000);
