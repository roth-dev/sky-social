import React, { useMemo, useRef } from "react";
import { StyleSheet, Alert } from "react-native";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ErrorState } from "@/components/placeholders/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/lib/queries";
import { View } from "@/components/ui";
import TabView from "@/components/tabs";
import UserPostSection from "../sections/Post";
import UserMediaSection from "../sections/Media";
import UserLikeSection from "../sections/Likes";
import { useSettings } from "@/contexts/SettingsContext";

interface Props {
  handle: string;
}

export default function UserProfile({ handle }: Props) {
  const { user } = useAuth();
  const profileQuery = useProfile(handle);
  const headerHeight = useRef(200);

  const isOwner = useMemo(() => {
    return handle === user?.handle;
  }, [handle, user]);

  const handleEditProfile = () => {
    Alert.alert("Coming Soon", "Profile editing will be available soon!");
  };

  const handleMorePress = () => {
    Alert.alert("More Options", "Additional options coming soon!");
  };

  // Show error state
  if (profileQuery.error) {
    return (
      <View style={styles.container}>
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

  const currentProfile = profileQuery.data;

  // Show loading placeholder if profile is loading or not yet available
  if (profileQuery.isLoading || !currentProfile) {
    return (
      <View className="flex-1 bg-white">
        {/* You may want to import and use a ProfilePlaceholder here */}
        {/* Replace the following with your actual placeholder component if available */}
        {/* <ProfilePlaceholder /> */}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* <Header
        title={currentProfile.displayName || currentProfile.handle || ""}
        rightIcon={<Settings size={24} color={Colors.inverted[colorScheme]} />}
        onRightPress={() => router.push("/(tabs)/profile/settings")}
      /> */}
      <TabView
        headerHeight={headerHeight.current}
        renderHeader={() => (
          <ProfileHeader
            user={currentProfile}
            setHeaderHeight={(height) => {
              headerHeight.current = height;
            }}
            isOwnProfile={isOwner}
            onEditProfile={handleEditProfile}
            onMorePress={handleMorePress}
          />
        )}
        routes={[
          {
            key: "posts",
            name: "Posts",
            component: () => <UserPostSection handle={handle} />,
          },
          {
            key: "media",
            name: "Media",
            component: () => <UserMediaSection handle={handle} />,
          },
          {
            key: "videos",
            name: "Videos",
            component: () => <UserPostSection handle={handle} />,
          },
          ...(isOwner
            ? [
                {
                  key: "liked",
                  name: "Liked",
                  component: () => <UserLikeSection handle={handle} />,
                },
              ]
            : []),
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
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
    // backgroundColor: "#ffffff",
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
