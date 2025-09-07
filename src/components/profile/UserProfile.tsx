import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ErrorState } from "@/components/placeholders/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { View, Dialog } from "@/components/ui";
import TabView from "@/components/tabs";
import UserPostSection from "../sections/Post";
import UserMediaSection from "../sections/Media";
import UserLikeSection from "../sections/Likes";
import Loading from "../ui/Loading";
import UserVideoSection from "../sections/Videos";
import { useProfile } from "@/hooks/query";
import { t } from "@lingui/core/macro";
import { router } from "expo-router";

interface Props {
  handle: string;
}

const UserProfile = ({ handle }: Props) => {
  const { user } = useAuth();
  const profileQuery = useProfile(handle);
  const [headerHeight, setHeaderHeight] = useState(200);

  const isOwner = useMemo(() => {
    return handle === user?.handle;
  }, [handle, user]);

  const routes = useMemo(() => {
    return [
      {
        key: "posts",
        name: t`Posts`,
        component: () => <UserPostSection handle={handle} />,
      },
      {
        key: "media",
        name: t`Media`,
        component: () => <UserMediaSection handle={handle} />,
      },
      {
        key: "videos",
        name: t`Videos`,
        component: () => <UserVideoSection handle={handle} />,
      },
      ...(isOwner
        ? [
            {
              key: "liked",
              name: t`Liked`,
              component: () => <UserLikeSection handle={handle} />,
            },
          ]
        : []),
    ];
  }, [handle, isOwner]);

  const handleEditProfile = () => {
    router.push("/setting/account-settings");
  };

  const handleMorePress = () => {
    Dialog.show(t`More Options`, t`Additional options coming soon!`);
  };

  // Show error state
  if (profileQuery.error) {
    return (
      <View style={styles.container}>
        <ErrorState
          title={t`Unable to load profile`}
          description={
            profileQuery.error?.message ||
            t`Something went wrong while loading your profile.`
          }
          onRetry={() => profileQuery.refetch()}
        />
      </View>
    );
  }

  const profileData = profileQuery.data;

  // Show loading placeholder if profile is loading or not yet available
  if (profileQuery.isLoading || !profileData) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Loading size="large" />
        {/* You may want to import and use a ProfilePlaceholder here */}
        {/* Replace the following with your actual placeholder component if available */}
        {/* <ProfilePlaceholder /> */}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <TabView
        headerHeight={headerHeight}
        renderHeader={() => (
          <ProfileHeader
            user={profileData}
            setHeaderHeight={setHeaderHeight}
            isOwnProfile={isOwner}
            onEditProfile={handleEditProfile}
            onMorePress={handleMorePress}
          />
        )}
        routes={routes}
      />
    </View>
  );
};

export default UserProfile;

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
