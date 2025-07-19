import React, { useCallback } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SearchActor } from "@/types/search";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { HStack, Text, VStack } from "../ui";
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

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/profile/${user.handle}`);
    }
  }, [onPress, user]);

  const handleFollow = useCallback(async () => {
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
  }, [isAuthenticated, isFollowing, followMutation, unfollowMutation, user]);

  return (
    <Button
      variant="ghost"
      className="border-b-[0.5px] rounded-none border-b-gray-200 dark:border-b-gray-700"
      onPress={handlePress}
    >
      <Avatar
        uri={user.avatar}
        size="large"
        fallbackText={user.displayName || user.handle}
      />

      <VStack className="flex-1">
        <HStack>
          <VStack className="flex-1">
            <Text font="semiBold" numberOfLines={1}>
              {user.displayName || user.handle}
            </Text>
            <Text
              className="text-[#6b7280] dark:text-[#6b7280]"
              numberOfLines={1}
            >
              @{user.handle}
            </Text>
          </VStack>
          {!isOwnProfile && isAuthenticated && (
            <Button
              title={
                followLoading ? "..." : isFollowing ? "Following" : "Follow"
              }
              variant={isFollowing ? "outline" : "primary"}
              size="small"
              onPress={handleFollow}
              disabled={followLoading}
            />
          )}
        </HStack>

        {!!user.description && (
          <Text
            className="text-[#6b7280] dark:text-[#6b7280]"
            size="sm"
            numberOfLines={1}
          >
            {user.description}
          </Text>
        )}
      </VStack>
    </Button>
  );
}
