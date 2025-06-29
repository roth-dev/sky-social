import { BskyAgent } from '@atproto/api';
import { storage, AuthSession } from './storage';

export class ATProtoClient {
  private agent: BskyAgent;
  private isAuthenticated = false;
  private currentSession: AuthSession | null = null;

  constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social',
    });
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
      console.error('Failed to initialize from storage:', error);
      // Clear invalid session data
      await storage.clearAuthSession();
      return false;
    }
  }

  async login(identifier: string, password: string) {
    try {
      const response = await this.agent.login({
        identifier,
        password,
      });
      
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
      
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
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
      console.error('Failed to refresh session:', error);
      return false;
    }
  }

  async getTimeline(limit = 30, cursor?: string) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await this.agent.getTimeline({
        limit,
        cursor,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      // Check if it's an auth error and try to refresh
      if (error.status === 401 || error.message?.includes('authentication')) {
        const refreshed = await this.refreshSession();
        if (refreshed) {
          // Retry the request
          try {
            const response = await this.agent.getTimeline({
              limit,
              cursor,
            });
            return { success: true, data: response.data };
          } catch (retryError: any) {
            console.error('Failed to get timeline after refresh:', retryError);
            return { success: false, error: retryError.message };
          }
        }
      }
      
      console.error('Failed to get timeline:', error);
      return { success: false, error: error.message };
    }
  }

  async getProfile(actor: string) {
    try {
      const response = await this.agent.getProfile({ actor });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Failed to get profile:', error);
      return { success: false, error: error.message };
    }
  }

  async getAuthorFeed(actor: string, limit = 30, cursor?: string) {
    try {
      const response = await this.agent.getAuthorFeed({
        actor,
        limit,
        cursor,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Failed to get author feed:', error);
      return { success: false, error: error.message };
    }
  }

  async getActorLikes(actor: string, limit = 30, cursor?: string) {
    try {
      const response = await this.agent.getActorLikes({
        actor,
        limit,
        cursor,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Failed to get actor likes:', error);
      return { success: false, error: error.message };
    }
  }

  async getPostThread(uri: string, depth = 6, parentHeight = 80) {
    try {
      const response = await this.agent.getPostThread({
        uri,
        depth,
        parentHeight,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Failed to get post thread:', error);
      return { success: false, error: error.message };
    }
  }

  async followProfile(did: string) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await this.agent.follow(did);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Failed to follow profile:', error);
      return { success: false, error: error.message };
    }
  }

  async unfollowProfile(followUri: string) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      await this.agent.deleteFollow(followUri);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to unfollow profile:', error);
      return { success: false, error: error.message };
    }
  }

  async createPost(text: string, images?: any[]) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const record: any = {
        text,
        createdAt: new Date().toISOString(),
      };

      if (images && images.length > 0) {
        // Handle image upload logic here
        // This would require implementing image upload to AT Protocol
      }

      const response = await this.agent.post(record);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Failed to create post:', error);
      return { success: false, error: error.message };
    }
  }

  async createReply(text: string, parentUri: string, parentCid: string, rootUri: string, rootCid: string) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const record: any = {
        text,
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

      const response = await this.agent.post(record);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Failed to create reply:', error);
      return { success: false, error: error.message };
    }
  }

  async likePost(uri: string, cid: string) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await this.agent.like(uri, cid);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Failed to like post:', error);
      return { success: false, error: error.message };
    }
  }

  async unlikePost(likeUri: string) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      await this.agent.deleteLike(likeUri);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to unlike post:', error);
      return { success: false, error: error.message };
    }
  }

  async repost(uri: string, cid: string) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await this.agent.repost(uri, cid);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Failed to repost:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteRepost(repostUri: string) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      await this.agent.deleteRepost(repostUri);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to delete repost:', error);
      return { success: false, error: error.message };
    }
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
    
    // Clear stored session data
    await storage.clearAll();
    
    // Clear agent session
    this.agent.session = undefined;
  }
}

export const atprotoClient = new ATProtoClient();