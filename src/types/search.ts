export interface SearchActor {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  indexedAt: string;
  viewer?: {
    muted?: boolean;
    blockedBy?: boolean;
    blocking?: string;
    following?: string;
    followedBy?: string;
  };
  labels?: Array<{
    src: string;
    uri: string;
    cid: string;
    val: string;
    cts: string;
  }>;
}

export interface SearchActorsResponse {
  actors: SearchActor[];
  cursor?: string;
}

export interface SearchPostsResponse {
  posts: any[];
  cursor?: string;
  hitsTotal?: number;
}

export interface FeedGenerator {
  uri: string;
  cid: string;
  did: string;
  creator: SearchActor;
  displayName: string;
  description?: string;
  avatar?: string;
  likeCount?: number;
  indexedAt: string;
  labels?: Array<{
    src: string;
    uri: string;
    cid: string;
    val: string;
    cts: string;
  }>;
}

export interface PopularFeedsResponse {
  feeds: FeedGenerator[];
  cursor?: string;
}

export interface SuggestedFollowsResponse {
  actors: SearchActor[];
  cursor?: string;
}

export type SearchResultType = 'users' | 'posts' | 'feeds';

export interface SearchFilters {
  type: SearchResultType;
  sortBy?: 'relevance' | 'recent' | 'popular';
  timeRange?: 'all' | 'day' | 'week' | 'month';
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  isSearching: boolean;
  hasSearched: boolean;
}