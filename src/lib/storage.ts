import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { Language, ThemeMode } from "@/contexts/SettingsContext";

const STORAGE_KEYS = {
  AUTH_SESSION: "@skysocial/auth_session",
  USER_PROFILE: "@skysocial/user_profile",
  LANGUAGE: "@skysocial/language",
  THEME_MODE: "@skysocial/theme_mode",
  ACCOUNTS: "@skysocial/accounts",
  ACTIVE_ACCOUNT: "@skysocial/active_account",
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

interface AccountData {
  session: AuthSession;
  profile: UserProfile;
  addedAt: string;
}

interface StoredAccounts {
  [did: string]: AccountData;
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

  // Settings methods
  async saveLanguage(language: Language): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  }

  async getLanguage(): Promise<Language | null> {
    try {
      const language = await this.getItem(STORAGE_KEYS.LANGUAGE);
      return language as Language;
    } catch (error) {
      console.error("Failed to get language:", error);
      return null;
    }
  }

  async saveThemeMode(themeMode: ThemeMode): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.THEME_MODE, themeMode);
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  }

  async getThemeMode(): Promise<ThemeMode | null> {
    try {
      const themeMode = await this.getItem(STORAGE_KEYS.THEME_MODE);
      return themeMode as ThemeMode;
    } catch (error) {
      console.error("Failed to get theme mode:", error);
      return null;
    }
  }

  // Clear all stored data
  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearAuthSession(),
      this.clearUserProfile(),
      // Note: We don't clear settings (language/theme) on logout
    ]);
  }

  // Multi-account methods
  async saveAccount(session: AuthSession, profile: UserProfile): Promise<void> {
    try {
      const accounts = await this.getAccounts();
      const accountData: AccountData = {
        session,
        profile,
        addedAt: new Date().toISOString(),
      };

      accounts[profile.did] = accountData;
      await this.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

      // Set as active account
      await this.setActiveAccount(profile.did);
    } catch (error) {
      console.error("Failed to save account:", error);
    }
  }

  async getAccounts(): Promise<StoredAccounts> {
    try {
      const accountsData = await this.getItem(STORAGE_KEYS.ACCOUNTS);
      if (accountsData) {
        return JSON.parse(accountsData);
      }
      return {};
    } catch (error) {
      console.error("Failed to get accounts:", error);
      return {};
    }
  }

  async removeAccount(did: string): Promise<void> {
    try {
      const accounts = await this.getAccounts();
      delete accounts[did];
      await this.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

      // If this was the active account, clear it
      const activeAccountDid = await this.getActiveAccount();
      if (activeAccountDid === did) {
        await this.clearActiveAccount();
      }
    } catch (error) {
      console.error("Failed to remove account:", error);
    }
  }

  async setActiveAccount(did: string): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT, did);
    } catch (error) {
      console.error("Failed to set active account:", error);
    }
  }

  async getActiveAccount(): Promise<string | null> {
    try {
      return await this.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT);
    } catch (error) {
      console.error("Failed to get active account:", error);
      return null;
    }
  }

  async clearActiveAccount(): Promise<void> {
    try {
      await this.removeItem(STORAGE_KEYS.ACTIVE_ACCOUNT);
    } catch (error) {
      console.error("Failed to clear active account:", error);
    }
  }

  async switchAccount(did: string): Promise<AccountData | null> {
    try {
      const accounts = await this.getAccounts();
      const accountData = accounts[did];

      if (accountData) {
        // Save current session and profile
        await this.saveAuthSession(accountData.session);
        await this.saveUserProfile(accountData.profile);
        await this.setActiveAccount(did);
        return accountData;
      }
      return null;
    } catch (error) {
      console.error("Failed to switch account:", error);
      return null;
    }
  }
}

export const storage = new StorageManager();
export type { AuthSession, UserProfile, AccountData, StoredAccounts };
