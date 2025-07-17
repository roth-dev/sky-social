import React from "react";
import { StyleSheet, TouchableOpacity, Dimensions } from "react-native";
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
import { Text, View } from "../ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { t } from "@lingui/core/macro";

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
  const formatJoinDate = (indexedAt?: string) => {
    if (!indexedAt) return "Recently joined";

    const date = new Date(indexedAt);
    return `Joined ${date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
  };

  const extractWebsiteFromDescription = (description?: string) => {
    if (!description) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = description.match(urlRegex);
    return match ? match[0] : null;
  };

  const website = extractWebsiteFromDescription(user?.description);

  return (
    <View
      onLayout={(e) => {
        setHeaderHeight?.(e.nativeEvent.layout.height);
      }}
      pointerEvents="none"
      style={styles.container}
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
      <View style={styles.content}>
        {/* Avatar and Actions Row */}
        <View darkColor="none" style={styles.avatarRow}>
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

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.moreButton} onPress={onMorePress}>
              <MoreHorizontal
                size={20}
                color={Colors.background.primary.light}
              />
            </TouchableOpacity>

            {isOwnProfile ? (
              <Button
                title={t`Edit Profile`}
                variant="outline"
                size="medium"
                onPress={onEditProfile}
                style={styles.actionButton}
              />
            ) : (
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={onMessage}
                >
                  <MessageCircle size={18} color="#6b7280" />
                </TouchableOpacity>
                <Button
                  title={
                    followLoading
                      ? t`...`
                      : isFollowing
                      ? t`Following`
                      : t`Follow`
                  }
                  variant={isFollowing ? "outline" : "primary"}
                  size="medium"
                  onPress={onFollow}
                  disabled={followLoading}
                  style={styles.followButton}
                />
              </View>
            )}
          </View>
        </View>

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
          <View style={styles.metadataRow}>
            {!!website && (
              <TouchableOpacity style={styles.metadataItem}>
                <LinkIcon size={14} color="#3b82f6" />
                <Text style={styles.metadataLink} numberOfLines={1}>
                  {website.replace(/^https?:\/\//, "")}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.metadataItem}>
              <Calendar size={14} color="#6b7280" />
              <Text style={styles.metadataText}>
                {formatJoinDate(user.indexedAt)}
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem}>
              <Text font="semiBold">
                {formatNumber(user.followsCount || 0)}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text font="semiBold">
                {formatNumber(user.followersCount || 0)}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Text font="semiBold">{formatNumber(user.postsCount || 0)}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
  },
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
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    paddingHorizontal: 20,
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  followButton: {
    paddingHorizontal: 20,
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
  metadataRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: width * 0.6,
  },
  metadataText: {
    fontSize: 14,
    color: "#6b7280",
  },
  metadataLink: {
    fontSize: 14,
    color: "#3b82f6",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
});
