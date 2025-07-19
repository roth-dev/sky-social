import React, { useCallback } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ATProfile } from "@/types/atproto";
import {
  MoreHorizontal,
  Link as LinkIcon,
  Calendar,
  MessageCircle,
} from "lucide-react-native";
import { Image } from "expo-image";
import { HStack, Text, View, VStack } from "../ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Formater } from "@/lib/format";

interface ProfileHeaderProps {
  user: ATProfile;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  followLoading?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  onEditProfile?: () => void;
  onMorePress?: () => void;
  setHeaderHeight?: (height: number) => void;
}

const { width } = Dimensions.get("window");

export function ProfileHeader({
  user,
  isOwnProfile = false,
  isFollowing = false,
  followLoading = false,
  onFollow,
  onMessage,
  onEditProfile,
  onMorePress,
  setHeaderHeight,
}: ProfileHeaderProps) {
  const { colorScheme } = useSettings();
  const formatJoinDate = useCallback((indexedAt?: string) => {
    if (!indexedAt) return "Recently joined";

    const date = new Date(indexedAt);
    return `Joined ${date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
  }, []);

  return (
    <View
      onLayout={(e) => {
        setHeaderHeight?.(e.nativeEvent.layout.height);
      }}
      pointerEvents="none"
    >
      {/* Cover Image */}
      <View
        style={[
          styles.coverImage,
          {
            backgroundColor: user.banner
              ? "transparent"
              : Colors.background.secondary[colorScheme],
          },
        ]}
      >
        {!!user.banner && (
          <Image
            source={{ uri: user.banner }}
            style={styles.bannerImage}
            contentFit="cover"
          />
        )}
        <View style={styles.coverOverlay} />
      </View>

      {/* Profile Content */}
      <VStack className="px-4">
        {/* Avatar and Actions Row */}
        <HStack darkColor="none" style={styles.avatarRow}>
          <View
            style={[
              styles.avatarContainer,
              {
                borderColor: Colors.border[colorScheme],
              },
            ]}
          >
            <Avatar
              uri={user.avatar}
              size="xl"
              fallbackText={user.displayName || user.handle}
              style={styles.avatar}
            />
          </View>

          <HStack>
            <Button
              variant="outline"
              rightIcon={MoreHorizontal}
              shape="round"
              size="medium"
            />

            {isOwnProfile ? (
              <Button
                title={t`Edit Profile`}
                variant="outline"
                size="medium"
                onPress={onEditProfile}
              />
            ) : (
              <HStack>
                <Button
                  shape="round"
                  variant="outline"
                  rightIcon={MessageCircle}
                />
                <Button
                  title={
                    followLoading
                      ? t`...`
                      : isFollowing
                      ? t`Following`
                      : t`Follow`
                  }
                  variant={isFollowing ? "outline" : "primary"}
                  onPress={onFollow}
                  disabled={followLoading}
                />
              </HStack>
            )}
          </HStack>
        </HStack>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text font="bold" style={styles.displayName}>
            {user.displayName || user.handle}
          </Text>
          <Text style={styles.handle}>@{user.handle}</Text>

          {!!user.description && (
            <Text style={styles.description}>{user?.description}</Text>
          )}

          {/* Metadata Row */}
          <HStack className="mt-2">
            <Calendar size={14} color="#6b7280" />
            <Text style={styles.metadataText}>
              {formatJoinDate(user.createdAt)}
            </Text>
          </HStack>

          {/* Stats Row */}
          <HStack className="mt-2 gap-4">
            <Button variant="ghost" className="px-0 gap-1">
              <Text font="semiBold">
                {Formater.formatNumberToKOrM(user.followsCount || 0)}
              </Text>
              <Text className="text-gray-500">
                <Trans>Following</Trans>
              </Text>
            </Button>
            <Button variant="ghost" className="px-0 gap-1">
              <Text font="semiBold">
                {Formater.formatNumberToKOrM(user.followersCount || 0)}
              </Text>
              <Text className="text-gray-500">
                <Trans>Followers</Trans>
              </Text>
            </Button>
            <Button variant="ghost" className="px-0 gap-1">
              <Text font="semiBold">
                {Formater.formatNumberToKOrM(user.postsCount || 0)}
              </Text>
              <Text className="text-gray-500">
                <Trans>Posts</Trans>
              </Text>
            </Button>
          </HStack>
        </View>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  coverImage: {
    height: 200,
    width: "100%",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  avatarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: -48,
    marginBottom: 16,
  },
  avatarContainer: {
    borderWidth: 2,
    borderRadius: 52,
  },
  avatar: {
    width: 96,
    height: 96,
  },
  profileInfo: {
    gap: 8,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },
  handle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: -4,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: "#374151",
    marginTop: 8,
  },
  metadataText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
