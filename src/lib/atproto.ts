import { AtpAgent } from "@atproto/api";
import { storage, AuthSession } from "./storage";

export class ATProtoClient {
  private agent: AtpAgent;
  private isAuthenticated = false;
  private currentSession: AuthSession | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  constructor() {
    this.agent = new AtpAgent({
      service: "https://bsky.social",
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        // Reset retry count on success
        this.retryCount = 0;
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(
          `${context} attempt ${attempt + 1} failed:`,
          error.message
        );

        // Don't retry on authentication errors
        if (error.status === 401 || error.message?.includes("authentication")) {
          throw error;
        }

        // Don't retry on client errors (4xx except 401, 408, 429)
        if (
          error.status >= 400 &&
          error.status < 500 &&
          error.status !== 408 &&
          error.status !== 429
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
    try {
      const session = await storage.getAuthSession();
      if (session) {
        // Resume session with stored credentials
        await this.agent.resumeSession({
          accessJwt: session.accessJwt,
          refreshJwt: session.refreshJwt,
          handle: session.handle,
          did: session.did,
          email: session.email,
          emailConfirmed: session.emailConfirmed,
          emailAuthFactor: session.emailAuthFactor,
          active: session.active,
        });

        this.currentSession = session;
        this.isAuthenticated = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to initialize from storage:", error);
      // Clear invalid session data
      await storage.clearAuthSession();
      return false;
    }
  }

  async login(identifier: string, password: string) {
    try {
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

      return { success: false, error: "Login failed" };
    } catch (error: any) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async refreshSession(): Promise<boolean> {
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

  // Modified to work for both authenticated and unauthenticated users
  async getTimeline(limit = 30, cursor?: string) {
    try {
      // For unauthenticated users, try to get a public timeline
      // Use the "What's Hot" feed as a public timeline
      const response = await this.retryWithBackoff(
        () =>
          this.agent.app.bsky.feed.getFeed(
            {
              limit,
              cursor,
              feed: "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot",
            },
            {
              headers: {
                "Accept-Language": "en,km",
              },
            }
          ),
        "Get Timeline"
      );

      return { success: true, data: response.data };
    } catch (error: any) {
      // If the public feed fails, try the authenticated timeline for logged-in users
      if (this.isAuthenticated) {
        try {
          const response = await this.retryWithBackoff(
            () => this.agent.getTimeline({ limit, cursor }),
            "Get Authenticated Timeline"
          );
          return { success: true, data: response.data };
        } catch (authError: any) {
          console.error("Failed to get authenticated timeline:", authError);
          // Fall through to return mock data
        }
      }

      console.error("Failed to get timeline:", error);
      
      // Return mock timeline data as fallback
      return {
        success: true,
        data: {
          feed: this.getMockTimelineData(),
          cursor: undefined,
        },
      };
    }
  }

  // Mock data for when API is unavailable
  private getMockTimelineData() {
    return [
      {
        post: {
          uri: "at://did:plc:mock1/app.bsky.feed.post/mock1",
          cid: "mock-cid-1",
          author: {
            did: "did:plc:mock1",
            handle: "alice.bsky.social",
            displayName: "Alice Johnson",
            avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
            description: "Software engineer and nature lover 🌲",
          },
          record: {
            text: "Just discovered this amazing hiking trail! The views are absolutely breathtaking. Nature never fails to inspire me. 🏔️ #hiking #nature",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          embed: {
            $type: "app.bsky.embed.images#view",
            images: [
              {
                thumb: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400",
                fullsize: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800",
                alt: "Mountain hiking trail with scenic views",
                aspectRatio: { width: 16, height: 9 },
              },
            ],
          },
          replyCount: 12,
          repostCount: 8,
          likeCount: 45,
          indexedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        post: {
          uri: "at://did:plc:mock2/app.bsky.feed.post/mock2",
          cid: "mock-cid-2",
          author: {
            did: "did:plc:mock2",
            handle: "bob.bsky.social",
            displayName: "Bob Chen",
            avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
            description: "Tech enthusiast | Coffee addict ☕",
          },
          record: {
            text: "Working on a new project using React Native and Expo. The developer experience keeps getting better! 🚀",
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          },
          replyCount: 6,
          repostCount: 15,
          likeCount: 32,
          indexedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        post: {
          uri: "at://did:plc:mock3/app.bsky.feed.post/mock3",
          cid: "mock-cid-3",
          author: {
            did: "did:plc:mock3",
            handle: "sarah.bsky.social",
            displayName: "Sarah Williams",
            avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
            description: "Artist & Designer | Creating beautiful things ✨",
          },
          record: {
            text: "Finished my latest digital artwork! It's inspired by the colors of sunset over the ocean. Art is my way of capturing fleeting moments. 🎨",
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
          embed: {
            $type: "app.bsky.embed.images#view",
            images: [
              {
                thumb: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400",
                fullsize: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800",
                alt: "Digital artwork showing sunset colors over ocean",
                aspectRatio: { width: 4, height: 3 },
              },
            ],
          },
          replyCount: 18,
          repostCount: 22,
          likeCount: 89,
          indexedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
      },
    ];
  }

  async getProfile(actor: string) {
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
    } catch (error: any) {
      console.error("Failed to get profile:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async getAuthorFeed(actor: string, limit = 30, cursor?: string) {
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
    } catch (error: any) {
      console.error("Failed to get author feed:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async getActorLikes(actor: string, limit = 30, cursor?: string) {
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
    } catch (error: any) {
      console.error("Failed to get actor likes:", error);

      // Handle specific cases where likes might not be available
      if (
        error.status === 400 ||
        error.message?.includes("Invalid request") ||
        error.message?.includes("not found") ||
        error.message?.includes("not available")
      ) {
        return {
          success: true,
          data: { feed: [], cursor: undefined },
        };
      }

      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async getPostThread(uri: string, depth = 6, parentHeight = 80) {
    try {
      // Validate URI parameter
      if (!uri || typeof uri !== "string" || uri.trim().length === 0) {
        throw new Error("Invalid post URI");
      }

      const cleanUri = uri.trim();

      const response = await this.retryWithBackoff(
        () => this.agent.getPostThread({ uri: cleanUri, depth, parentHeight }),
        "Get Post Thread"
      );

      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Failed to get post thread:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async searchActors(query: string, limit = 25, cursor?: string) {
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
    } catch (error: any) {
      console.error("Failed to search actors:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async searchPosts(query: string, limit = 25, cursor?: string) {
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
    } catch (error: any) {
      console.error("Failed to search posts:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async getPopularFeedGenerators(limit = 50, cursor?: string) {
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
    } catch (error: any) {
      console.error("Failed to get popular feed generators:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async getSuggestedFollows(actor?: string) {
    try {
      const response = await this.retryWithBackoff(
        () => this.agent.getSuggestions({ limit: 50 }),
        "Get Suggested Follows"
      );

      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Failed to get suggested follows:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async followProfile(did: string) {
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
    } catch (error: any) {
      console.error("Failed to follow profile:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async unfollowProfile(followUri: string) {
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
    } catch (error: any) {
      console.error("Failed to unfollow profile:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async createPost(text: string, images?: any[]) {
    if (!this.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        throw new Error("Post text cannot be empty");
      }

      const record: any = {
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };

      if (images && images.length > 0) {
        // Handle image upload logic here
        // This would require implementing image upload to AT Protocol
      }

      const response = await this.retryWithBackoff(
        () => this.agent.post(record),
        "Create Post"
      );

      return { success: true, data: response };
    } catch (error: any) {
      console.error("Failed to create post:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
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

      const record: any = {
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
    } catch (error: any) {
      console.error("Failed to create reply:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async likePost(uri: string, cid: string) {
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
    } catch (error: any) {
      console.error("Failed to like post:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async unlikePost(likeUri: string) {
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
    } catch (error: any) {
      console.error("Failed to unlike post:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async repost(uri: string, cid: string) {
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
    } catch (error: any) {
      console.error("Failed to repost:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async deleteRepost(repostUri: string) {
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
    } catch (error: any) {
      console.error("Failed to delete repost:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  private getErrorMessage(error: any): string {
    // Handle specific AT Protocol errors
    if (error.status) {
      switch (error.status) {
        case 400:
          return "Invalid request. Please check your input and try again.";
        case 401:
          return "Authentication failed. Please log in again.";
        case 403:
          return "Access denied. You don't have permission to perform this action.";
        case 404:
          return "Content not found. It may have been deleted or moved.";
        case 408:
          return "Request timeout. Please check your connection and try again.";
        case 429:
          return "Too many requests. Please wait a moment and try again.";
        case 500:
          return "Server error. The service is temporarily unavailable.";
        case 502:
        case 503:
        case 504:
          return "Service temporarily unavailable. Please try again in a few moments.";
        default:
          if (error.status >= 500) {
            return "Server error. Please try again later.";
          }
          break;
      }
    }

    // Handle specific error messages
    if (error.message) {
      if (error.message.includes("UpstreamFailure")) {
        return "Service temporarily unavailable. Please try again in a few moments.";
      }
      if (error.message.includes("network")) {
        return "Network error. Please check your internet connection.";
      }
      if (error.message.includes("timeout")) {
        return "Request timed out. Please try again.";
      }
      if (error.message.includes("authentication")) {
        return "Authentication error. Please log in again.";
      }
      if (
        error.message.includes("Profile not found") ||
        error.message.includes("Actor not found")
      ) {
        return "Profile not found. The user may not exist or may have changed their handle.";
      }
      if (error.message.includes("Invalid request")) {
        return "Invalid request. Please check your input and try again.";
      }
    }

    // Fallback to original error message or generic message
    return error.message || "An unexpected error occurred. Please try again.";
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getCurrentSession() {
    return this.currentSession;
  }

  async logout() {
    this.isAuthenticated = false;
    this.currentSession = null;
    this.retryCount = 0;

    // Clear stored session data
    await storage.clearAll();

    // Clear agent session
    this.agent.session = undefined;
  }
}

export const atprotoClient = new ATProtoClient();