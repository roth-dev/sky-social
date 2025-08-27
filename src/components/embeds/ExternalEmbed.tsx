import React from "react";
import { TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import { EmbedExternal } from "@/types/embed";
import { ExternalLink } from "lucide-react-native";
import { Image } from "expo-image";
import { Text, View, RichText } from "../ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import FastImage from "react-native-fast-image";

interface ExternalEmbedProps {
  external?: EmbedExternal;
  isDetailView?: boolean;
  onLinkPress?: (url: string) => void;
}

export function ExternalEmbed({
  external,
  isDetailView = false,
  onLinkPress,
}: ExternalEmbedProps) {
  const { colorScheme } = useSettings();

  if (!external) {
    return null;
  }

  const handlePress = async () => {
    try {
      // Validate URL format first
      const url = external.uri;
      if (!isValidUrl(url)) {
        Alert.alert(
          "Invalid URL",
          "This link appears to be invalid or malformed."
        );
        return;
      }

      if (onLinkPress) {
        onLinkPress(url);
      } else {
        // Try to open the URL with better error handling
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert(
            "Cannot Open Link",
            "This link cannot be opened on your device. It may be an invalid or unsupported URL format.",
            [
              { text: "Copy URL", onPress: () => copyToClipboard(url) },
              { text: "OK", style: "cancel" },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
      Alert.alert(
        "Link Error",
        "Unable to open this link. Would you like to copy the URL instead?",
        [
          { text: "Copy URL", onPress: () => copyToClipboard(external.uri) },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        Alert.alert("Copied", "URL copied to clipboard");
      } else {
        // Fallback for environments without clipboard API
        Alert.alert("URL", url);
      }
    } catch (error) {
      console.error("Failed to copy URL:", error);
      Alert.alert("URL", url);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ["http:", "https:"].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      let domain = urlObj.hostname;

      // Remove www. prefix
      if (domain.startsWith("www.")) {
        domain = domain.substring(4);
      }

      return domain;
    } catch {
      // Fallback for invalid URLs
      return url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];
    }
  };

  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isDetailView && styles.detailContainer,
        {
          borderColor: Colors.border[colorScheme],
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {!!external.thumb && isValidImageUrl(external.thumb) && (
        <View style={styles.imageContainer}>
          <FastImage
            source={{ uri: external.thumb }}
            style={[styles.image, isDetailView && styles.detailImage]}
            resizeMode="cover"
            // onError={(error) => {
            //   console.warn("Failed to load thumbnail:", error.error);
            // }}
          />
        </View>
      )}

      <View
        style={[styles.content, !external.thumb && styles.contentWithoutImage]}
      >
        <View style={styles.header}>
          <ExternalLink size={14} color="#6b7280" />
          <Text
            // style={styles.domain}
            numberOfLines={1}
          >
            {getDomain(external.uri)}
          </Text>
        </View>

        <Text
          // style={[styles.title, isDetailView && styles.detailTitle]}
          numberOfLines={isDetailView ? 3 : 2}
        >
          {external.title}
        </Text>

        {!!external.description && (
          <RichText
            value={external.description}
            style={[
              styles.description,
              isDetailView && styles.detailDescription,
            ]}
            numberOfLines={isDetailView ? 4 : 2}
            disableLinks={false}
            enableTags={true}
            onLinkPress={onLinkPress}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  detailContainer: {
    borderRadius: 16,
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailImage: {
    aspectRatio: 16 / 9,
  },
  content: {
    padding: 12,
  },
  contentWithoutImage: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  domain: {
    fontSize: 12,
    // color: "#6b7280",
    fontWeight: "500",
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    // color: "#111827",
    lineHeight: 20,
    marginBottom: 4,
  },
  detailTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    // color: "#6b7280",
    lineHeight: 18,
  },
  detailDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
