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
  }, [initializeAuth]);

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
