import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import {
  MessageCircle,
  Users,
  Heart,
  Image as ImageIcon,
  Search,
  Wifi,
  RefreshCw,
  TriangleAlert as AlertTriangle,
} from "lucide-react-native";
import Loading from "../ui/Loading";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

interface EmptyStateProps {
  type:
    | "timeline"
    | "posts"
    | "followers"
    | "following"
    | "likes"
    | "media"
    | "search"
    | "offline";
  title?: string;
  description?: string;
  style?: ViewStyle;
}

export function EmptyState({
  type,
  title,
  description,
  style,
}: EmptyStateProps) {
  const getEmptyStateConfig = () => {
    switch (type) {
      case "timeline":
        return {
          icon: <MessageCircle size={48} color="#9ca3af" />,
          title: title || t`Welcome to Sky Social!`,
          description:
            description ||
            t`Your timeline will appear here once you follow some people and they start posting.`,
        };
      case "posts":
        return {
          icon: <MessageCircle size={48} color="#9ca3af" />,
          title: title || t`No posts yet`,
          description:
            description ||
            t`When this user posts something, it will appear here.`,
        };
      case "followers":
        return {
          icon: <Users size={48} color="#9ca3af" />,
          title: title || t`No followers yet`,
          description:
            description ||
            t`When people follow this account, they will appear here.`,
        };
      case "following":
        return {
          icon: <Users size={48} color="#9ca3af" />,
          title: title || t`Not following anyone yet`,
          description:
            description ||
            t`When this user follows people, they will appear here.`,
        };
      case "likes":
        return {
          icon: <Heart size={48} color="#9ca3af" />,
          title: title || t`No liked posts yet`,
          description:
            description ||
            t`When this user likes posts, they will appear here.`,
        };
      case "media":
        return {
          icon: <ImageIcon size={48} color="#9ca3af" />,
          title: title || t`No media yet`,
          description:
            description ||
            t`When this user shares photos and videos, they will appear here.`,
        };
      case "search":
        return {
          icon: <Search size={48} color="#9ca3af" />,
          title: title || t`No results found`,
          description:
            description ||
            t`Try searching for something else or check your spelling.`,
        };
      case "offline":
        return {
          icon: <Wifi size={48} color="#9ca3af" />,
          title: title || t`You're offline`,
          description:
            description || t`Check your internet connection and try again.`,
        };
      default:
        return {
          icon: <MessageCircle size={48} color="#9ca3af" />,
          title: title || t`Nothing here yet`,
          description:
            description || t`Content will appear here when available.`,
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>{config.icon}</View>
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.description}>{config.description}</Text>
    </View>
  );
}

interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export function LoadingState({
  message = t`Loading...`,
  style,
}: LoadingStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Loading size="large" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({
  title = t`Something went wrong`,
  description = t`We encountered an error while loading this content.`,
  onRetry,
  style,
}: ErrorStateProps) {
  // Determine error type based on description
  const isNetworkError =
    description?.includes("network") ||
    description?.includes("connection") ||
    description?.includes("offline");

  const isServerError =
    description?.includes("server") ||
    description?.includes("unavailable") ||
    description?.includes("UpstreamFailure");

  const getErrorIcon = () => {
    if (isNetworkError) {
      return <Wifi size={48} color="#ef4444" />;
    }
    if (isServerError) {
      return <RefreshCw size={48} color="#ef4444" />;
    }
    return <AlertTriangle size={48} color="#ef4444" />;
  };

  const getErrorTitle = () => {
    if (isNetworkError) {
      return t`Connection Problem`;
    }
    if (isServerError) {
      return t`Service Unavailable`;
    }
    return title;
  };

  const getErrorDescription = () => {
    if (isNetworkError) {
      return t`Please check your internet connection and try again.`;
    }
    if (isServerError) {
      return t`The service is temporarily unavailable. Please try again in a few moments.`;
    }
    return description;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.errorIconContainer}>{getErrorIcon()}</View>
      <Text style={styles.errorTitle}>{getErrorTitle()}</Text>
      <Text style={styles.description}>{getErrorDescription()}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={16} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.retryText}>
            <Trans>Try Again</Trans>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
