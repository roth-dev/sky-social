import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  PropsWithChildren,
} from "react";
import { atprotoClient } from "@/lib/atproto";
import { storage } from "@/lib/storage";
import { ATProfile } from "@/types/atproto";
import { ActivityIndicator } from "react-native";
import { View } from "@/components/ui";

interface AuthContextType {
  isAuthenticated: boolean;
  user: ATProfile | null;
  login: (
    identifier: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<ATProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);

      // Try to restore session from storage
      const sessionRestored = await atprotoClient.initializeFromStorage();

      if (sessionRestored) {
        setIsAuthenticated(true);

        // Try to get cached user profile
        const cachedProfile = await storage.getUserProfile();
        if (cachedProfile) {
          setUser(cachedProfile);
        }

        // Refresh user profile in background
        await refreshUserProfile();
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      // Clear any corrupted data
      await storage.clearAll();
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserProfile = async () => {
    try {
      const session = atprotoClient.getCurrentSession();
      if (session) {
        const profileResult = await atprotoClient.getProfile(session.handle);
        if (profileResult.success) {
          setUser(profileResult.data);
          // Cache the updated profile
          await storage.saveUserProfile(profileResult.data);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      setLoading(true);

      const result = await atprotoClient.login(identifier, password);
      if (result.success) {
        setIsAuthenticated(true);

        // Get user profile
        const profileResult = await atprotoClient.getProfile(identifier);
        if (profileResult.success) {
          setUser(profileResult.data);
          // Cache the profile
          await storage.saveUserProfile(profileResult.data);
        }

        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await atprotoClient.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await refreshUserProfile();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
