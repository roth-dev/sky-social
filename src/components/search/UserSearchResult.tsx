import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SearchActor } from "@/types/search";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { Text, View } from "../ui";
import { useFollowProfile, useUnfollowProfile } from "@/hooks/mutation";

interface UserSearchResultProps {
  user: SearchActor;
  onPress?: () => void;
}

export function UserSearchResult({ user, onPress }: UserSearchResultProps) {
  const { isAuthenticated, user: currentUser } = useAuth();
  const followMutation = useFollowProfile();
  const unfollowMutation = useUnfollowProfile();

  const isOwnProfile = currentUser?.did === user.did;
  const isFollowing = !!user.viewer?.following;
  const followLoading = followMutation.isPending || unfollowMutation.isPending;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/profile/${user.handle}`);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) return;

    try {
      if (isFollowing && user.viewer?.following) {
        await unfollowMutation.mutateAsync({
          followUri: user.viewer.following,
        });
      } else {
        await followMutation.mutateAsync({ did: user.did });
      }
    } catch (error) {
      console.error("Failed to update follow status:", error);
    }
  };

  const formatFollowerCount = (count?: number) => {
    if (!count) return "";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Avatar
        uri={user.avatar}
        size="large"
        fallbackText={user.displayName || user.handle}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.displayName} numberOfLines={1}>
              {user.displayName || user.handle}
            </Text>
            <Text style={styles.handle} numberOfLines={1}>
              @{user.handle}
            </Text>
          </View>

          {!isOwnProfile && isAuthenticated && (
            <Button
              title={
                followLoading ? "..." : isFollowing ? "Following" : "Follow"
              }
              variant={isFollowing ? "outline" : "primary"}
              size="small"
              onPress={handleFollow}
              disabled={followLoading}
              style={styles.followButton}
            />
          )}
        </View>

        {user.description && (
          <Text style={styles.description} numberOfLines={2}>
            {user.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  handle: {
    fontSize: 14,
    color: "#6b7280",
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginTop: 4,
  },
  followButton: {
    paddingHorizontal: 16,
  },
});
