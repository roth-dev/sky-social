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
import { useSessionStateHandler } from "@/hooks/useSessionStateHandler";

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

  // Handle app state changes for session validation
  useSessionStateHandler();

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      const sessionRestored = await atprotoClient.initializeFromStorage();
      if (sessionRestored) {
        setIsAuthenticated(true);

        const cachedProfile = await storage.getUserProfile();
        if (cachedProfile) {
          setUser(cachedProfile);
        }
        await refreshUserProfile();
      }
    } catch {
      await storage.clearAll();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();

    // Set up periodic session validation (every 10 minutes as backup)
    const sessionCheckInterval = setInterval(async () => {
      if (isAuthenticated) {
        const isValid = await atprotoClient.validateSession();
        if (!isValid) {
          console.warn("Periodic session check failed, session may be invalid");
          // Don't auto-logout, let API calls handle it
        }
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [initializeAuth, isAuthenticated]);

  const refreshUserProfile = async () => {
    try {
      const session = atprotoClient.getCurrentSession();
      if (session) {
        const profileResult = await atprotoClient.getProfile(session.handle);
        if (profileResult.success && profileResult.data) {
          setUser(profileResult.data as ATProfile);
          await storage.saveUserProfile(profileResult.data);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error);

      // Check if it's an auth error and try to refresh session
      if (
        (error as { status?: number; message?: string })?.status === 401 ||
        (error as { message?: string })?.message?.includes("authentication")
      ) {
        console.log(
          "Auth error in profile refresh, attempting session refresh..."
        );
        const refreshed = await atprotoClient.performSessionRefresh();
        if (!refreshed) {
          console.warn("Session refresh failed, user may need to re-login");
          // Don't auto-logout here, let the user continue
        }
      }
    }
  };

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const result = await atprotoClient.login(identifier, password);
      if (result.success) {
        setIsAuthenticated(true);
        // Get user profile
        const profileResult = await atprotoClient.getProfile(identifier);
        if (profileResult.success && profileResult.data) {
          setUser(profileResult.data as ATProfile);
          // Cache the profile
          await storage.saveUserProfile(profileResult.data as ATProfile);
        }

        return { success: true };
      }
      return { success: false, error: result.error };
    } catch {
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
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
  }, []);

  const refreshUser = useCallback(async () => {
    await refreshUserProfile();
  }, []);

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
