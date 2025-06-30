import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Header } from "@/components/Header";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabContent } from "@/components/profile/ProfileTabContent";
import {
  ProfilePlaceholder,
  ProfileTabPlaceholder,
} from "@/components/placeholders/ProfilePlaceholder";
import { EmptyState, ErrorState } from "@/components/placeholders/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import {
  useProfile,
  useAuthorFeed,
  useActorLikes,
  useAuthorMediaFeed,
} from "@/lib/queries";
import { Settings } from "lucide-react-native";
import { router } from "expo-router";
import { Image } from "expo-image";

const TABS = [
  { key: "posts", title: "Posts" },
  { key: "media", title: "Media" },
  { key: "liked", title: "Liked" },
];

export default function ProfileScreen() {
  const { isAuthenticated, user, logout, login } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");

  // Login form state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Queries
  const profileQuery = useProfile(user?.handle || "");
  const postsQuery = useAuthorFeed(user?.handle || "");
  const likedQuery = useActorLikes(user?.handle || "");
  const mediaQuery = useAuthorMediaFeed(user?.handle || "");

  const handleEditProfile = () => {
    Alert.alert("Coming Soon", "Profile editing will be available soon!");
  };

  const handleMorePress = () => {
    Alert.alert("More Options", "Additional options coming soon!");
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(identifier, password);
      if (result.success) {
        // Login successful, user will be redirected automatically
        setIdentifier("");
        setPassword("");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    if (!isAuthenticated) return;
    
    profileQuery.refetch();
    switch (activeTab) {
      case "posts":
        postsQuery.refetch();
        break;
      case "liked":
        likedQuery.refetch();
        break;
      case "media":
        mediaQuery.refetch();
        break;
    }
  }, [activeTab, isAuthenticated]);

  const handleLoadMore = () => {
    if (!isAuthenticated) return;
    
    switch (activeTab) {
      case "posts":
        if (
          postsQuery.hasNextPage &&
          !postsQuery.isFetchingNextPage &&
          !postsQuery.isLoading
        ) {
          postsQuery.fetchNextPage();
        }
        break;
      case "liked":
        if (
          likedQuery.hasNextPage &&
          !likedQuery.isFetchingNextPage &&
          !likedQuery.isLoading
        ) {
          likedQuery.fetchNextPage();
        }
        break;
      case "media":
        if (
          mediaQuery.hasNextPage &&
          !mediaQuery.isFetchingNextPage &&
          !mediaQuery.isLoading
        ) {
          mediaQuery.fetchNextPage();
        }
        break;
    }
  };

  const getTabData = (tabKey: string) => {
    switch (tabKey) {
      case "posts":
        return postsQuery.data?.pages.flatMap((page) => page?.feed) || [];
      case "liked":
        return likedQuery.data?.pages.flatMap((page) => page?.feed) || [];
      case "media":
        return mediaQuery.data || [];
      default:
        return [];
    }
  };

  const getTabCount = (tabKey: string) => {
    switch (tabKey) {
      case "posts":
        return profileQuery.data?.postsCount || 0;
      case "liked":
        return likedQuery.data?.pages.flatMap((page) => page?.feed).length || 0;
      case "media":
        return mediaQuery.data?.length || 0;
      default:
        return 0;
    }
  };

  const getTabLoading = (tabKey: string) => {
    switch (tabKey) {
      case "posts":
        return postsQuery.isLoading;
      case "liked":
        return likedQuery.isLoading;
      case "media":
        return mediaQuery.isLoading;
      default:
        return false;
    }
  };

  const getTabLoadingMore = (tabKey: string) => {
    switch (tabKey) {
      case "posts":
        return postsQuery.isFetchingNextPage;
      case "liked":
        return likedQuery.isFetchingNextPage;
      case "media":
        return mediaQuery.isFetchingNextPage;
      default:
        return false;
    }
  };

  const isRefreshing =
    profileQuery.isFetching ||
    (activeTab === "posts" && postsQuery.isFetching) ||
    (activeTab === "liked" && likedQuery.isFetching) ||
    (activeTab === "media" && mediaQuery.isFetching);

  // Show login form for unauthenticated users
  if (!isAuthenticated || !user) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {Platform.OS !== "web" && <Header title="Profile" />}
        
        <ScrollView 
          style={styles.loginContainer}
          contentContainerStyle={styles.loginContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginHeader}>
            <Image
              source={require("../../../assets/images/icon.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.loginTitle}>Welcome to Sky Social</Text>
            <Text style={styles.loginSubtitle}>
              Connect with the decentralized social web
            </Text>
          </View>

          <View style={styles.loginForm}>
            <Input
              label="Username or Email"
              placeholder="your.handle or email@example.com"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              title={loading ? "Signing in..." : "Sign In"}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />

            <Text style={styles.signupText}>
              Don't have a Bluesky account? Create one at bsky.app
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Show loading placeholder
  if (profileQuery.isLoading) {
    return (
      <View style={styles.container}>
        {Platform.OS !== "web" && (
          <Header
            title="Profile"
            rightIcon={<Settings size={24} color="#111827" />}
            onRightPress={() => logout()}
          />
        )}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ProfilePlaceholder />

          {/* Tab Bar Placeholder */}
          <View style={styles.tabBarContainer}>
            <View style={styles.tabBar}>
              {TABS.map((tab) => (
                <View key={tab.key} style={styles.tabItemPlaceholder}>
                  <View style={styles.tabTextPlaceholder} />
                  <View style={styles.tabCountPlaceholder} />
                </View>
              ))}
            </View>
          </View>

          <ProfileTabPlaceholder type={activeTab as any} />
        </ScrollView>
      </View>
    );
  }

  // Show error state
  if (profileQuery.error) {
    return (
      <View style={styles.container}>
        {Platform.OS !== "web" && (
          <Header
            title="Profile"
            rightIcon={<Settings size={24} color="#111827" />}
            onRightPress={() => logout()}
          />
        )}
        <ErrorState
          title="Unable to load profile"
          description={
            profileQuery.error?.message ||
            "Something went wrong while loading your profile."
          }
          onRetry={() => profileQuery.refetch()}
        />
      </View>
    );
  }

  const currentProfile = profileQuery.data || user;

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" && (
        <Header
          title={currentProfile.displayName || currentProfile.handle}
          rightIcon={<Settings size={24} color="#111827" />}
          onRightPress={() => logout()}
        />
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          user={currentProfile}
          isOwnProfile={true}
          onEditProfile={handleEditProfile}
          onMorePress={handleMorePress}
        />

        {/* Tab Bar */}
        <View style={styles.tabBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBar}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  activeTab === tab.key && styles.activeTabItem,
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
                  ]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContentContainer}>
          {getTabLoading(activeTab) ? (
            <ProfileTabPlaceholder type={activeTab as any} />
          ) : (
            <ProfileTabContent
              tabKey={activeTab}
              data={getTabData(activeTab)}
              loading={getTabLoading(activeTab)}
              loadingMore={getTabLoadingMore(activeTab)}
              onRefresh={() => {}}
              onLoadMore={handleLoadMore}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loginContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  loginHeader: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  loginSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  loginForm: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 16,
  },
  signupText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
  tabBarContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginRight: 8,
  },
  activeTabItem: {
    borderBottomColor: "#3b82f6",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 2,
  },
  activeTabText: {
    color: "#3b82f6",
  },
  tabContentContainer: {
    flex: 1,
    minHeight: 400,
  },
  tabItemPlaceholder: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    marginRight: 8,
  },
  tabTextPlaceholder: {
    width: 60,
    height: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginBottom: 4,
  },
  tabCountPlaceholder: {
    width: 20,
    height: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },
});