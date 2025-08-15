import { AtpAgent, AppBskyFeedDefs } from "@atproto/api";
import { storage, AuthSession } from "./storage";
import { POST_PRIFIX, PUBLIC_SERVICE_URL, SERVICE_URL } from "@/constants";
import { isNative } from "@/platform";
import { getErrorMessage } from "@/utils/errorUtils";
import { logger } from "@/utils/logger";

type ActorDid = string;
export type AuthorFilter =
  | "posts_with_replies"
  | "posts_no_replies"
  | "posts_and_author_threads"
  | "posts_with_media"
  | "posts_with_video";
type FeedUri = string;
type ListUri = string;

export type FeedDescriptor =
  | "following"
  | `author|${ActorDid}|${AuthorFilter}`
  | `feedgen|${FeedUri}`
  | `likes|${ActorDid}`
  | `list|${ListUri}`;

export interface FeedParams {
  mergeFeedEnabled?: boolean;
  mergeFeedSources?: string[];
  feedCacheKey?: "discover" | "explore" | undefined;
}

const publicFeeds = [
  "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot",
  "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/hot-classic",
  "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/bsky-team",
] as const;

export const PUBLIC_FEED_DESCRIPTOR: FeedDescriptor = `feedgen|${publicFeeds[0]}`;

export class ATProtoClient {
  private agent: AtpAgent;
  private isAuthenticated = false;
  private currentSession: AuthSession | null = null;
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  constructor() {
    this.agent = this.createAgent(false);
  }

  /**
   * Create a new AtpAgent instance with the correct service URL
   * @param authenticated Whether the user is authenticated
   */
  private createAgent(authenticated: boolean) {
    // Native always uses SERVICE_URL and requires login
    if (isNative) {
      return new AtpAgent({ service: SERVICE_URL });
    }
    // Web: use SERVICE_URL if authenticated, else PUBLIC_SERVICE_URL
    return new AtpAgent({
      service: authenticated ? SERVICE_URL : PUBLIC_SERVICE_URL,
    });
  }

  private setAgent(authenticated: boolean) {
    this.agent = this.createAgent(authenticated);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        // Reset retry count on success
        return result;
      } catch (error: unknown) {
        lastError = error;
        const errMsg = (error as Error)?.message || String(error);
        console.warn(`${context} attempt ${attempt + 1} failed:`, errMsg);

        // Don't retry on authentication errors
        if (
          (error as { status?: number; message?: string }).status === 401 ||
          (error as { message?: string }).message?.includes("authentication")
        ) {
          throw error;
        }

        // Don't retry on client errors (4xx except 401, 408, 429)
        if (
          (error as { status?: number }).status !== undefined &&
          (error as { status: number }).status >= 400 &&
          (error as { status: number }).status < 500 &&
          (error as { status: number }).status !== 408 &&
          (error as { status: number }).status !== 429
        ) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === this.maxRetries) {
          throw error;
        }

        // Calculate exponential backoff delay
        const delayMs =
          this.retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Retrying ${context} in ${delayMs}ms...`);
        await this.delay(delayMs);
      }
    }
    throw lastError;
  }

  async initializeFromStorage(): Promise<boolean> {
    logger.log("initializeFromStorage");
    try {
      const session = await storage.getAuthSession();
      if (session) {
        // Resume session with stored credentials
        this.setAgent(true); // Use SERVICE_URL for authenticated
        await this.agent.resumeSession({
          accessJwt: session.accessJwt,
          refreshJwt: session.refreshJwt,
          handle: session.handle,
          did: session.did,
          email: session.email,
          emailConfirmed: session.emailConfirmed,
          emailAuthFactor: session.emailAuthFactor,
          active: session.active ?? false,
        });

        this.currentSession = session;
        this.isAuthenticated = true;
        return true;
      } else {
        // Not authenticated
        this.setAgent(false); // Use PUBLIC_SERVICE_URL for unauthenticated web
      }
      return false;
    } catch {
      // Clear invalid session data
      await storage.clearAuthSession();
      this.setAgent(false); // Use PUBLIC_SERVICE_URL for unauthenticated web
      return false;
    }
  }

  async login(identifier: string, password: string) {
    logger.log("login", { identifier });
    try {
      this.setAgent(true); // Switch to SERVICE_URL for login
      const response = await this.retryWithBackoff(
        () => this.agent.login({ identifier, password }),
        "Login"
      );

      if (response.success) {
        this.isAuthenticated = true;

        // Save session data to storage
        const sessionData: AuthSession = {
          accessJwt: response.data.accessJwt,
          refreshJwt: response.data.refreshJwt,
          handle: response.data.handle,
          did: response.data.did,
          email: response.data.email,
          emailConfirmed: response.data.emailConfirmed,
          emailAuthFactor: response.data.emailAuthFactor,
          active: response.data.active,
        };

        this.currentSession = sessionData;
        await storage.saveAuthSession(sessionData);

        return { success: true, data: response.data };
      }

      // If login fails, revert to unauthenticated agent for web
      this.setAgent(false);
      return { success: false, error: "Login failed" };
    } catch (error: unknown) {
      // If login fails, revert to unauthenticated agent for web
      this.setAgent(false);
      console.error("Login failed:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async refreshSession(): Promise<boolean> {
    logger.log("refreshSession");
    try {
      if (!this.currentSession) {
        return false;
      }

      // The BskyAgent should automatically handle token refresh
      // We just need to update our stored session data
      const session = this.agent.session;
      if (session) {
        const sessionData: AuthSession = {
          accessJwt: session.accessJwt,
          refreshJwt: session.refreshJwt,
          handle: session.handle,
          did: session.did,
          email: session.email,
          emailConfirmed: session.emailConfirmed,
          emailAuthFactor: session.emailAuthFactor,
          active: session.active,
        };

        this.currentSession = sessionData;
        await storage.saveAuthSession(sessionData);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to refresh session:", error);
      return false;
    }
  }

  // Get public timeline for both authenticated and unauthenticated users
  async getTimeline(limit = 30, cursor?: string) {
    logger.log("getTimeline", { limit, cursor });
    try {
      // Try multiple public feeds for unauthenticated users

      // Try each public feed
      for (const feedUri of publicFeeds) {
        try {
          const response = await this.retryWithBackoff(
            () =>
              this.agent.app.bsky.feed.getFeed(
                {
                  limit,
                  cursor,
                  feed: feedUri,
                },
                {
                  headers: {
                    "Accept-Language": "en,km",
                  },
                }
              ),
            `Get Public Feed: ${feedUri}`
          );

          return { success: true, data: response.data };
        } catch (error: unknown) {
          // Swallow error, try next feed
          console.warn(`Failed to fetch feed ${feedUri}:`, error);
          continue;
        }
      }

      // If authenticated, try the personal timeline as fallback
      if (this.isAuthenticated) {
        try {
          const response = await this.retryWithBackoff(
            () => this.agent.getTimeline({ limit, cursor }),
            "Get Authenticated Timeline"
          );
          return { success: true, data: response.data };
        } catch (authError) {
          console.error("Failed to get authenticated timeline:", authError);
        }
      }

      // If all feeds fail, try to get posts from popular profiles
      try {
        const popularPosts = await this.getPopularPosts(limit);
        return {
          success: true,
          data: {
            feed: popularPosts,
            cursor: undefined,
          },
        };
      } catch (popularError: unknown) {
        console.error("Failed to get popular posts:", popularError);
      }

      // Return empty feed as final fallback
      return {
        success: true,
        data: {
          feed: [],
          cursor: undefined,
        },
      };
    } catch (error: unknown) {
      console.error("Failed to get timeline:", error);

      // Return empty feed on error
      return {
        success: true,
        data: {
          feed: [],
          cursor: undefined,
        },
      };
    }
  }

  // Get the authenticated user's timeline (following feed)
  async getFollowingFeed(limit = 30, cursor?: string) {
    logger.log("getFollowingFeed", { limit, cursor });
    try {
      const response = await this.retryWithBackoff(
        () => this.agent.getTimeline({ limit, cursor }),
        "Get Following Feed"
      );
      return { success: true, data: response.data };
    } catch (error: unknown) {
      console.error("Failed to get following feed:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  // Get posts from popular/well-known profiles
  private async getPopularPosts(limit: number = 30) {
    const popularHandles = [
      "bsky.app",
      "jay.bsky.team",
      "pfrazee.com",
      "why.bsky.team",
      "dholms.xyz",
      "atproto.com",
    ];

    const allPosts: AppBskyFeedDefs.FeedViewPost[] = [];

    for (const handle of popularHandles) {
      try {
        const response = await this.retryWithBackoff(
          () =>
            this.agent.getAuthorFeed({
              actor: handle,
              limit: Math.ceil(limit / popularHandles.length),
            }),
          `Get Posts from ${handle}`
        );

        if (response.success && response.data.feed) {
          allPosts.push(...response.data.feed);
        }
      } catch (error: unknown) {
        console.warn(`Failed to get posts from ${handle}:`, error);
        continue;
      }

      // Stop if we have enough posts
      if (allPosts.length >= limit) {
        break;
      }
    }

    // Sort by creation time (newest first) and limit
    return allPosts
      .sort(
        (a, b) =>
          new Date(String(b.post.record.createdAt)).getTime() -
          new Date(String(a.post.record.createdAt)).getTime()
      )
      .slice(0, limit);
  }

  async getProfile(actor: string) {
    logger.log("getProfile", { actor });
    try {
      // Validate actor parameter
      if (!actor || typeof actor !== "string" || actor.trim().length === 0) {
        throw new Error("Invalid actor parameter");
      }

      const cleanActor = actor.trim();

      const response = await this.retryWithBackoff(
        () => this.agent.getProfile({ actor: cleanActor }),
        "Get Profile"
      );

      return { success: true, data: response.data };
    } catch (error: unknown) {
      console.error("Failed to get profile:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async getAuthorFeed(actor: string, limit = 30, cursor?: string) {
    logger.log("getAuthorFeed", { actor, limit, cursor });
    try {
      // Validate actor parameter
      if (!actor || typeof actor !== "string" || actor.trim().length === 0) {
        throw new Error("Invalid actor parameter");
      }

      const cleanActor = actor.trim();

      const response = await this.retryWithBackoff(
        () => this.agent.getAuthorFeed({ actor: cleanActor, limit, cursor }),
        "Get Author Feed"
      );

      return { success: true, data: response.data };
    } catch (error: unknown) {
      console.error("Failed to get author feed:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async getActorLikes(actor: string, limit = 30, cursor?: string) {
    logger.log("getActorLikes", { actor, limit, cursor });
    try {
      // Validate actor parameter
      if (!actor || typeof actor !== "string" || actor.trim().length === 0) {
        throw new Error("Invalid actor parameter");
      }

      const cleanActor = actor.trim();

      // First check if the profile exists
      const profileCheck = await this.getProfile(cleanActor);
      if (!profileCheck.success) {
        return {
          success: false,
          error: "Profile not found",
        };
      }

      const response = await this.retryWithBackoff(
        () => this.agent.getActorLikes({ actor: cleanActor, limit, cursor }),
        "Get Actor Likes"
      );

      return { success: true, data: response.data };
    } catch (error: unknown) {
      console.error("Failed to get actor likes:", error);

      // Handle specific cases where likes might not be available
      const err = error as { status?: number; message?: string };
      if (
        err.status === 400 ||
        err.message?.includes("Invalid request") ||
        err.message?.includes("not found") ||
        err.message?.includes("not available")
      ) {
        return {
          success: true,
          data: { feed: [], cursor: undefined },
        };
      }

      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async getPostThread(uri: string, depth = 6, parentHeight = 80) {
    logger.log("getPostThread", { uri, depth, parentHeight });
    try {
      // Validate URI parameter
      if (!uri || typeof uri !== "string" || uri.trim().length === 0) {
        throw new Error("Invalid post URI");
      }
      const cleanUri = `${POST_PRIFIX}${uri.trim()}`;

      const response = await this.retryWithBackoff(
        () => this.agent.getPostThread({ uri: cleanUri, depth, parentHeight }),
        "Get Post Thread"
      );

      return { success: true, data: response.data };
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (err && err.message) {
        console.error("Failed to get post thread:", err.message);
      } else {
        console.error("Failed to get post thread:", error);
      }
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async searchActors(query: string, limit = 25, cursor?: string) {
    logger.log("searchActors", { query, limit, cursor });
    try {
      // Validate query parameter
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        throw new Error("Search query cannot be empty");
      }

      const cleanQuery = query.trim();

      const response = await this.retryWithBackoff(
        () =>
          this.agent.searchActors({
            term: cleanQuery,
            limit,
            cursor,
          }),
        "Search Actors"
      );

      return { success: true, data: response.data };
    } catch (error: unknown) {
      console.error("Failed to search actors:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async searchPosts(query: string, limit = 25, cursor?: string) {
    logger.log("searchPosts", { query, limit, cursor });
    try {
      // Validate query parameter
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        throw new Error("Search query cannot be empty");
      }

      const cleanQuery = query.trim();

      const response = await this.retryWithBackoff(
        () =>
          this.agent.app.bsky.feed.searchPosts({
            q: cleanQuery,
            limit,
            cursor,
          }),
        "Search Posts"
      );

      return { success: true, data: response.data };
    } catch (error: unknown) {
      console.error("Failed to search posts:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async getPopularFeedGenerators(limit = 50, cursor?: string) {
    logger.log("getPopularFeedGenerators", { limit, cursor });
    try {
      const response = await this.retryWithBackoff(
        () =>
          this.agent.app.bsky.unspecced.getPopularFeedGenerators({
            limit,
            cursor,
          }),
        "Get Popular Feed Generators"
      );

      return { success: true, data: response.data };
    } catch (error: unknown) {
      console.error("Failed to get popular feed generators:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async getSuggestedFollows(): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
  }> {
    logger.log("getSuggestedFollows");
    try {
      const response = await this.retryWithBackoff(
        () => this.agent.getSuggestions({ limit: 50 }),
        "Get Suggested Follows"
      );

      return { success: true, data: response.data };
    } catch (error: unknown) {
      console.error("Failed to get suggested follows:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async followProfile(did: string) {
    logger.log("followProfile", { did });
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      if (!did || typeof did !== "string" || did.trim().length === 0) {
        throw new Error("Invalid DID parameter");
      }

      const response = await this.retryWithBackoff(
        () => this.agent.follow(did.trim()),
        "Follow Profile"
      );

      return { success: true, data: response };
    } catch (error: unknown) {
      console.error("Failed to follow profile:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async unfollowProfile(followUri: string) {
    logger.log("unfollowProfile", { followUri });
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      if (
        !followUri ||
        typeof followUri !== "string" ||
        followUri.trim().length === 0
      ) {
        throw new Error("Invalid follow URI parameter");
      }

      await this.retryWithBackoff(
        () => this.agent.deleteFollow(followUri.trim()),
        "Unfollow Profile"
      );

      return { success: true };
    } catch (error: unknown) {
      console.error("Failed to unfollow profile:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async createPost(
    text: string,
    images?: { uri: string; alt?: string }[],
    video?: string
  ) {
    logger.log("createPost", { text, images: images?.length, video: !!video });
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        throw new Error("Post text cannot be empty");
      }

      const record: {
        text: string;
        createdAt: string;
        embed?: {
          $type: string;
          images?: unknown[];
          video?: unknown;
        };
      } = {
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };

      // Handle media uploads
      if (images && images.length > 0) {
        const { uploadImages } = await import("./blobUpload");
        const uploadResult = await uploadImages(this.agent, images);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Failed to upload images");
        }

        record.embed = {
          $type: "app.bsky.embed.images",
          images: uploadResult.images,
        };
      } else if (video) {
        const { uploadVideo } = await import("./blobUpload");
        const uploadResult = await uploadVideo(this.agent, video);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Failed to upload video");
        }

        record.embed = {
          $type: "app.bsky.embed.video",
          video: uploadResult.blob,
          ...(uploadResult.aspectRatio && {
            aspectRatio: uploadResult.aspectRatio,
          }),
        };
      }
      const response = await this.retryWithBackoff(
        () => this.agent.post(record),
        "Create Post"
      );

      return { success: true, data: response };
    } catch (error: unknown) {
      console.error("Failed to create post:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async createReply(
    text: string,
    parentUri: string,
    parentCid: string,
    rootUri: string,
    rootCid: string
  ) {
    logger.log("createReply", { text, parentUri, parentCid, rootUri, rootCid });
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        throw new Error("Reply text cannot be empty");
      }

      if (!parentUri || !parentCid || !rootUri || !rootCid) {
        throw new Error("Invalid reply parameters");
      }

      const record = {
        text: text.trim(),
        createdAt: new Date().toISOString(),
        reply: {
          root: {
            uri: rootUri,
            cid: rootCid,
          },
          parent: {
            uri: parentUri,
            cid: parentCid,
          },
        },
      };

      const response = await this.retryWithBackoff(
        () => this.agent.post(record),
        "Create Reply"
      );

      return { success: true, data: response };
    } catch (error: unknown) {
      console.error("Failed to create reply:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async likePost(uri: string, cid: string) {
    logger.log("likePost", { uri, cid });
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      if (!uri || !cid) {
        throw new Error("Invalid post URI or CID");
      }

      const response = await this.retryWithBackoff(
        () => this.agent.like(uri, cid),
        "Like Post"
      );

      return { success: true, data: response };
    } catch (error: unknown) {
      console.error("Failed to like post:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async unlikePost(likeUri: string) {
    logger.log("unlikePost", { likeUri });
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      if (!likeUri) {
        throw new Error("Invalid like URI");
      }

      await this.retryWithBackoff(
        () => this.agent.deleteLike(likeUri),
        "Unlike Post"
      );

      return { success: true };
    } catch (error: unknown) {
      console.error("Failed to unlike post:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async repost(uri: string, cid: string) {
    logger.log("repost", { uri, cid });
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      if (!uri || !cid) {
        throw new Error("Invalid post URI or CID");
      }

      const response = await this.retryWithBackoff(
        () => this.agent.repost(uri, cid),
        "Repost"
      );

      return { success: true, data: response };
    } catch (error: unknown) {
      console.error("Failed to repost:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  async deleteRepost(repostUri: string) {
    logger.log("deleteRepost", { repostUri });
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      if (!repostUri) {
        throw new Error("Invalid repost URI");
      }

      await this.retryWithBackoff(
        () => this.agent.deleteRepost(repostUri),
        "Delete Repost"
      );

      return { success: true };
    } catch (error: unknown) {
      console.error("Failed to delete repost:", error);
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  /**
   * Fetch a feed based on FeedDescriptor
   */
  async getFeedByDescriptor(
    descriptor: FeedDescriptor,
    limit = 30,
    cursor?: string
  ) {
    logger.log("getFeedByDescriptor", { descriptor, limit, cursor });
    try {
      if (descriptor === "following") {
        // Authenticated timeline
        return await this.getFollowingFeed(limit, cursor);
      }
      if (descriptor.startsWith("author|")) {
        // Author feed: author|<did>|<filter>
        const [, did, filter] = descriptor.split("|");
        const response = await this.retryWithBackoff(
          () =>
            this.agent.getAuthorFeed({
              actor: did,
              limit,
              cursor,
              filter: filter,
            }),
          "Get Author Feed"
        );
        return { success: true, data: response.data };
      }
      if (descriptor.startsWith("feedgen|")) {
        // Feed generator: feedgen|<feedUri>
        const [, feedUri] = descriptor.split("|");
        const response = await this.retryWithBackoff(
          () =>
            this.agent.app.bsky.feed.getFeed({
              feed: feedUri,
              limit,
              cursor,
            }),
          "Get Feed Generator"
        );
        return { success: true, data: response.data };
      }
      if (descriptor.startsWith("likes|")) {
        // Likes feed: likes|<did>
        const [, did] = descriptor.split("|");
        return await this.getActorLikes(did, limit, cursor);
      }
      if (descriptor.startsWith("list|")) {
        // List feed: list|<listUri>
        const [, listUri] = descriptor.split("|");
        const response = await this.retryWithBackoff(
          () =>
            this.agent.app.bsky.feed.getListFeed({
              list: listUri,
              limit,
              cursor,
            }),
          "Get List Feed"
        );
        return { success: true, data: response.data };
      }
      // fallback: public timeline
      return await this.getTimeline(limit, cursor);
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getCurrentSession() {
    return this.currentSession;
  }

  async logout() {
    logger.log("logout");
    this.isAuthenticated = false;
    this.currentSession = null;

    // Clear stored session data
    await storage.clearAll();

    // Reinitialize agent to clear session
    this.setAgent(false);
  }
}

export const atprotoClient = new ATProtoClient();
