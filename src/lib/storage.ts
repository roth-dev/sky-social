import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEYS = {
  AUTH_SESSION: "@skysocial/auth_session",
  USER_PROFILE: "@skysocial/user_profile",
} as const;

interface AuthSession {
  accessJwt: string;
  refreshJwt: string;
  handle: string;
  did: string;
  email?: string;
  emailConfirmed?: boolean;
  emailAuthFactor?: boolean;
  active?: boolean;
}

interface UserProfile {
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
}

class StorageManager {
  private isWeb = Platform.OS === "web";

  // Web storage fallback for AsyncStorage
  private async webSetItem(key: string, value: string): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  }

  private async webGetItem(key: string): Promise<string | null> {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  }

  private async webRemoveItem(key: string): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }

  // Generic storage methods
  private async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb) {
        await this.webSetItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error("Storage setItem error:", error);
    }
  }

  private async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb) {
        return await this.webGetItem(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error("Storage getItem error:", error);
      return null;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        await this.webRemoveItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Storage removeItem error:", error);
    }
  }

  // Auth session methods
  async saveAuthSession(session: AuthSession): Promise<void> {
    try {
      const sessionData = JSON.stringify(session);
      await this.setItem(STORAGE_KEYS.AUTH_SESSION, sessionData);
    } catch (error) {
      console.error("Failed to save auth session:", error);
    }
  }

  async getAuthSession(): Promise<AuthSession | null> {
    try {
      const sessionData = await this.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      return null;
    } catch (error) {
      console.error("Failed to get auth session:", error);
      return null;
    }
  }

  async clearAuthSession(): Promise<void> {
    try {
      await this.removeItem(STORAGE_KEYS.AUTH_SESSION);
    } catch (error) {
      console.error("Failed to clear auth session:", error);
    }
  }

  // User profile methods
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const profileData = JSON.stringify(profile);
      await this.setItem(STORAGE_KEYS.USER_PROFILE, profileData);
    } catch (error) {
      console.error("Failed to save user profile:", error);
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await this.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileData) {
        return JSON.parse(profileData);
      }
      return null;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      return null;
    }
  }

  async clearUserProfile(): Promise<void> {
    try {
      await this.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch (error) {
      console.error("Failed to clear user profile:", error);
    }
  }

  // Clear all stored data
  async clearAll(): Promise<void> {
    await Promise.all([this.clearAuthSession(), this.clearUserProfile()]);
  }
}

export const storage = new StorageManager();
export type { AuthSession, UserProfile };
