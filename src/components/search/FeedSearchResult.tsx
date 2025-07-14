import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { FeedGenerator } from "@/types/search";
import { Heart } from "lucide-react-native";
import { HStack, Text, VStack } from "../ui";
import { Formater } from "@/lib/format";
import { useSettings } from "@/contexts/SettingsContext";
import { Colors } from "@/constants/colors";

interface FeedSearchResultProps {
  feed: FeedGenerator;
  onPress?: () => void;
  rightContent?: React.ReactNode;
}

export function FeedSearchResult({
  feed,
  onPress,
  rightContent,
}: FeedSearchResultProps) {
  const { colorScheme } = useSettings();
  const borderColor = Colors.border[colorScheme];
  const backgroundColor = Colors.background.primary[colorScheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { borderBottomColor: borderColor, backgroundColor },
      ]}
      activeOpacity={0.7}
    >
      <HStack className="gap-4">
        <Avatar
          uri={feed.avatar}
          size="large"
          fallbackText={feed.displayName}
        />
        <VStack className="flex-1">
          <HStack className="justify-between">
            <VStack>
              <Text size="base" font="semiBold" numberOfLines={1}>
                {feed.displayName}
              </Text>
              <Text size="sm" numberOfLines={1}>
                by @{feed.creator.handle}
              </Text>
            </VStack>
            {rightContent}
          </HStack>
          {feed.description && (
            <Text size="sm" numberOfLines={2}>
              {feed.description}
            </Text>
          )}
          <HStack>
            <Heart size={12} />
            <Text size="sm">
              {Formater.formatNumberToKOrM(feed.likeCount ?? 0)} likes
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
