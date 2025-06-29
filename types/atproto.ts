export interface ATProfile {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  indexedAt?: string;
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

export interface ATPost {
  uri: string;
  cid: string;
  author: ATProfile;
  record: {
    text: string;
    createdAt: string;
    embed?: {
      $type: string;
      images?: Array<{
        alt: string;
        image: {
          $type: string;
          ref: any;
          mimeType: string;
          size: number;
        };
      }>;
    };
    reply?: {
      root: {
        uri: string;
        cid: string;
      };
      parent: {
        uri: string;
        cid: string;
      };
    };
    langs?: string[];
    facets?: Array<{
      index: {
        byteStart: number;
        byteEnd: number;
      };
      features: Array<{
        $type: string;
        uri?: string;
        tag?: string;
        did?: string;
      }>;
    }>;
  };
  embed?: {
    $type: string;
    images?: Array<{
      thumb: string;
      fullsize: string;
      alt: string;
      aspectRatio?: {
        width: number;
        height: number;
      };
    }>;
    external?: {
      uri: string;
      title: string;
      description: string;
      thumb?: string;
    };
    record?: {
      $type: string;
      record: ATPost;
    };
  };
  replyCount: number;
  repostCount: number;
  likeCount: number;
  indexedAt: string;
  viewer?: {
    like?: string;
    repost?: string;
    threadMuted?: boolean;
    replyDisabled?: boolean;
  };
  labels?: Array<{
    src: string;
    uri: string;
    cid: string;
    val: string;
    cts: string;
  }>;
}

export interface ATFeedItem {
  post: ATPost;
  reply?: {
    root: ATPost;
    parent: ATPost;
  };
  reason?: {
    $type: string;
    by: ATProfile;
    indexedAt: string;
  };
}

export interface ATAuthorFeedResponse {
  feed: ATFeedItem[];
  cursor?: string;
}

export interface ATLikesResponse {
  feed: ATFeedItem[];
  cursor?: string;
}