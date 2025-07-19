import React, { useCallback } from "react";
import { TouchableOpacity, ScrollView } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { SearchActor, FeedGenerator } from "@/types/search";
import { TrendingUp, Users, Rss, LucideIcon } from "lucide-react-native";
import { router } from "expo-router";
import { Button, HStack, Text, View, VStack } from "../ui";
import { Trans } from "@lingui/react/macro";
import { useSettings } from "@/contexts/SettingsContext";
import { Colors } from "@/constants/colors";

interface TrendingSectionProps {
  suggestedUsers?: SearchActor[];
  popularFeeds?: FeedGenerator[];
}

function RowHeader({
  title,
  onPress,
  Icon,
}: {
  Icon: LucideIcon;
  title: string;
  onPress?: () => void;
}) {
  const { colorScheme } = useSettings();
  return (
    <HStack className="justify-between p-3">
      <HStack>
        <Icon size={20} color={Colors.inverted[colorScheme]} />
        <Text font="semiBold" size="xl">
          <Trans>{title}</Trans>
        </Text>
      </HStack>
      <TouchableOpacity onPress={onPress}>
        <Text className="text-[#3b82f6] dark:text-[#3b82f6]">
          <Trans>See all</Trans>
        </Text>
      </TouchableOpacity>
    </HStack>
  );
}

function Profile({
  onPress,
  avatar,
  displayName,
  handle,
}: {
  avatar?: string;
  displayName: string;
  onPress?: () => void;
  handle: string;
}) {
  return (
    <Button
      onPress={onPress}
      variant="ghost"
      className="border border-gray-200 dark:border-gray-700 w-32"
    >
      <VStack className="flex-1 items-center">
        <Avatar uri={avatar} size="medium" fallbackText={displayName} />
        <Text font="semiBold" numberOfLines={1}>
          {displayName}
        </Text>
        <Text size="sm" numberOfLines={1} className="dark:text-gray-300">
          by @{handle}
        </Text>
      </VStack>
    </Button>
  );
}
export function TrendingSection({
  suggestedUsers = [],
  popularFeeds = [],
}: TrendingSectionProps) {
  const onUserPress = useCallback((handle: string) => {
    router.push(`/profile/${handle}`);
  }, []);

  const handleFeedPress = useCallback((feed: FeedGenerator) => {
    const safeFeedUri = encodeURIComponent(feed.uri);
    // need to implement
  }, []);

  const renderSuggestedUser = (user: SearchActor) => (
    <Profile
      key={user.did}
      displayName={user.displayName ?? ""}
      avatar={user.avatar}
      handle={user.handle}
      onPress={() => onUserPress(user.handle)}
    />
  );

  const renderPopularFeed = useCallback(
    (feed: FeedGenerator) => (
      <Profile
        key={feed.uri}
        displayName={feed.description ?? ""}
        onPress={() => handleFeedPress(feed)}
        avatar={feed.avatar}
        handle={feed.creator.handle}
      />
    ),
    [handleFeedPress]
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Trending Header */}
      <VStack className="items-center py-4">
        <HStack>
          <TrendingUp size={24} color={Colors.primary} />
          <Text font="semiBold" size="2xl">
            <Trans>Discover</Trans>
          </Text>
        </HStack>
        <Text className="text-[#6b7280] dark:text-[#6b7280]">
          <Trans>Find interesting people and feeds to follow</Trans>
        </Text>
      </VStack>

      {/* Suggested People */}
      {suggestedUsers.length > 0 && (
        <View>
          <RowHeader Icon={Users} title="Suggested People" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-4"
          >
            {suggestedUsers.slice(0, 10).map(renderSuggestedUser)}
          </ScrollView>
        </View>
      )}

      {/* Popular Feeds */}
      {popularFeeds.length > 0 && (
        <VStack>
          <RowHeader title="Popular Feeds" Icon={Rss} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-4"
          >
            {popularFeeds.slice(0, 10).map(renderPopularFeed)}
          </ScrollView>
        </VStack>
      )}

      {/* Search Tips */}
      <VStack className="p-4 gap-2">
        <Text size="xl" font="semiBold">
          <Trans>Search Tips</Trans>
        </Text>
        <SearchTips
          title="Find people"
          description="Search by handle (@username) or display name"
        />
        <SearchTips
          title="Discover posts"
          description="Search by handle (@username) or display name"
        />
        <SearchTips
          title="Explore feeds"
          description="Find custom feeds created by the community"
        />
      </VStack>
    </ScrollView>
  );
}

function SearchTips({
  description,
  title,
}: {
  title: string;
  description: string;
}) {
  const { colorScheme } = useSettings();
  return (
    <View
      style={[
        {
          backgroundColor: Colors.background.secondary[colorScheme],
        },
      ]}
      className="border-l-4 p-4 rounded-xl border-l-blue-500"
    >
      <Text font="semiBold">
        <Trans>{title}</Trans>
      </Text>
      <Text className="dark:text-[#6b7280]">
        <Trans>{description}</Trans>
      </Text>
    </View>
  );
}
