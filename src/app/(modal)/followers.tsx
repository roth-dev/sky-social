import React, { useState, useRef, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Header } from "@/components/Header";
import { UserSearchResult } from "@/components/search/UserSearchResult";
import { EmptyState, LoadingState } from "@/components/placeholders/EmptyState";
import { useFollowers, useFollowing } from "@/hooks/query";
import { SearchActor } from "@/types/search";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import PagerView from "@/components/pager";
import type PagerViewType from "react-native-pager-view";
import HeaderTab from "@/components/home/HeaderTab";
import { List } from "@/components/list";
import { useSharedValue } from "react-native-reanimated";
import { isWeb } from "@/platform";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { AppBskyActorDefs } from "@atproto/api";
import { OutputSchema as FollowersOutputSchema } from "@atproto/api/dist/client/types/app/bsky/graph/getFollowers";
import { OutputSchema as FollowingOutputSchema } from "@atproto/api/dist/client/types/app/bsky/graph/getFollows";

interface FollowersListProps {
  pageIndex: number;
  pageTitle: string;
  query: UseInfiniteQueryResult<
    InfiniteData<
      FollowersOutputSchema | FollowingOutputSchema | undefined,
      unknown
    >,
    Error
  >;
  headerHeight: number;
}

function FollowersList({
  pageIndex,
  pageTitle,
  query,
  headerHeight,
}: FollowersListProps) {
  const data: SearchActor[] = useMemo(() => {
    if (!query.data?.pages) return [];

    return query.data.pages.flatMap((page) => {
      if (!page) return [];

      let profiles: AppBskyActorDefs.ProfileView[] = [];

      // Type guard to check which type of data we have
      if (pageIndex === 0) {
        // Followers tab
        const followersPage = page as FollowersOutputSchema;
        profiles = followersPage.followers || [];
      } else {
        // Following tab
        const followingPage = page as FollowingOutputSchema;
        profiles = followingPage.follows || [];
      }

      // Convert ProfileView to SearchActor
      return profiles.map(
        (profile): SearchActor => ({
          did: profile.did,
          handle: profile.handle,
          displayName: profile.displayName,
          description: profile.description,
          avatar: profile.avatar,
          indexedAt: profile.indexedAt || new Date().toISOString(),
          viewer: profile.viewer
            ? {
                muted: profile.viewer.muted,
                blockedBy: profile.viewer.blockedBy,
                blocking: profile.viewer.blocking,
                following: profile.viewer.following,
                followedBy: profile.viewer.followedBy,
              }
            : undefined,
          labels: profile.labels?.map((label) => ({
            src: label.src,
            uri: label.uri,
            cid: label.cid || "",
            val: label.val,
            cts: label.cts,
          })),
        })
      );
    });
  }, [query.data?.pages, pageIndex]);

  const handleLoadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  if (query.isLoading) {
    return (
      <LoadingState
        message={`Loading ${pageTitle.toLowerCase()}...`}
        style={styles.emptyState}
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        type={pageIndex === 0 ? "followers" : "following"}
        title={pageIndex === 0 ? "No followers yet" : "Not following anyone"}
        description={
          pageIndex === 0
            ? "When people follow this account, they will appear here."
            : "When this account follows people, they will appear here."
        }
        style={styles.emptyState}
      />
    );
  }

  return (
    <List
      data={data}
      renderItem={({ item }: { item: unknown }) => {
        const user = item as SearchActor;
        return <UserSearchResult user={user} />;
      }}
      keyExtractor={(item: unknown, index: number) => {
        const typedItem = item as SearchActor;
        return `${typedItem.did}-${index}`;
      }}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={1.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: headerHeight,
      }}
      refreshing={query.isRefetching}
      onRefresh={() => query.refetch()}
      headerOffset={headerHeight}
    />
  );
}

export default function FollowersScreen() {
  const params = useLocalSearchParams();
  const { handle, initialTab } = params as {
    handle: string;
    initialTab: "followers" | "following";
  };
  const { colorScheme } = useSettings();
  const [headerHeight, setHeaderHeight] = useState(120);
  const [page, setPage] = useState(initialTab === "following" ? 1 : 0);
  const pagerRef = useRef<PagerViewType | null>(null);
  const indicatorIndex = useSharedValue<number>(
    initialTab === "following" ? 1 : 0
  );
  const [tabLayouts, setTabLayouts] = useState<{ width: number; x: number }[]>(
    []
  );

  // Queries
  const followersQuery = useFollowers(handle);
  const followingQuery = useFollowing(handle);

  const handlePageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      setPage(e.nativeEvent.position);
      indicatorIndex.value = e.nativeEvent.position;
    },
    [indicatorIndex]
  );

  const handleTabPress = useCallback(
    (index: number) => {
      setPage(index);
      indicatorIndex.value = index;

      if (pagerRef.current) {
        pagerRef.current.setPage(index);
      }
    },
    [indicatorIndex]
  );

  const pages = useMemo(
    () => [
      {
        title: "Followers",
        query: followersQuery,
      },
      {
        title: "Following",
        query: followingQuery,
      },
    ],
    [followersQuery, followingQuery]
  );

  const renderHeaderTabs = useCallback(() => {
    return (
      <HeaderTab
        indicatorIndex={indicatorIndex}
        setPage={handleTabPress}
        page={page}
        tabTitles={pages.map((p) => p.title)}
        tabLayouts={tabLayouts}
        setTabLayouts={setTabLayouts}
        className="pb-4"
        indicatorStyle={{ bottom: 0 }}
      />
    );
  }, [indicatorIndex, pages, handleTabPress, page, tabLayouts]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors.background.primary[colorScheme] },
      ]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <Header
        title={`@${handle}`}
        leftIcon={<ArrowLeft />}
        onLeftPress={() => router.back()}
        onHeightChange={setHeaderHeight}
        renderHeader={renderHeaderTabs}
        collapsible
        disableTopHeader={isWeb}
        disableSafeArea
      />
      <PagerView
        ref={pagerRef}
        initialPage={initialTab === "following" ? 1 : 0}
        onPageSelected={handlePageSelected}
        style={{ flex: 1 }}
        orientation={isWeb ? "stack" : "horizontal"}
      >
        {pages.map((pageItem, index) => (
          <View key={index} style={{ flex: 1 }}>
            <FollowersList
              pageIndex={index}
              pageTitle={pageItem.title}
              query={pageItem.query}
              headerHeight={headerHeight}
            />
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
  },
});
