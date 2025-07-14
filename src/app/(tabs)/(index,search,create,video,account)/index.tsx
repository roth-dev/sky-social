import { Header } from "@/components/Header";
import { Bell, UserCircle } from "lucide-react-native";
import { View } from "@/components/ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { Feed } from "@/components/Feed";
import { FeedDescriptor, PUBLIC_FEED_DESCRIPTOR } from "@/lib/atproto";
import { useState, useRef, useCallback, useMemo } from "react";
import PagerView from "@/components/pager";
import { useScrollStore } from "@/store/scrollStore";
import { useSharedValue } from "react-native-reanimated";
import type PagerViewType from "react-native-pager-view";
import HeaderTab from "@/components/home/HeaderTab";
import { useAuth } from "@/contexts/AuthContext";
import { isWeb } from "@/platform";
import { router } from "expo-router";

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useSettings();
  const { scrollY } = useScrollStore();
  const [headerHeight, setHeaderHeight] = useState(120);
  const [page, setPage] = useState(0);
  const pagerRef = useRef<PagerViewType | null>(null);
  const indicatorIndex = useSharedValue<number>(0);
  const [tabLayouts, setTabLayouts] = useState<{ width: number; x: number }[]>(
    []
  );

  // No need for onPageScroll for indicator, just snap on page change

  const handlePageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      setPage(e.nativeEvent.position);
      indicatorIndex.value = e.nativeEvent.position;
      setTimeout(() => scrollY.set(0), 100);
    },
    [indicatorIndex, scrollY]
  );

  const handleTabPress = useCallback(
    (index: number) => {
      if (!isAuthenticated && index === 1)
        if (!isAuthenticated) {
          router.push("/feeds");
        } else {
          setPage(index);
          indicatorIndex.value = index;

          if (pagerRef.current) {
            pagerRef.current.setPage(index);
          }
        }
    },
    [indicatorIndex, isAuthenticated]
  );

  const pages: { title: string; feed: FeedDescriptor | string }[] = useMemo(
    () => [
      {
        title: "For You",
        feed: PUBLIC_FEED_DESCRIPTOR,
      },
      ...(isAuthenticated
        ? [
            {
              title: "Following",
              feed: "following",
            },
          ]
        : [
            {
              title: "Feeds",
              feed: "",
            },
          ]),
    ],
    [isAuthenticated]
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
      />
    );
  }, [indicatorIndex, pages, handleTabPress, page, tabLayouts]);

  return (
    <View className="flex-1 bg-white">
      <Header
        isBlur
        onHeightChange={setHeaderHeight}
        renderHeader={renderHeaderTabs}
        collapsible
        disbleTopHeader={isWeb}
        title="Sky Social"
        leftIcon={
          <UserCircle
            size={24}
            color={
              isDarkMode
                ? Colors.background.primary.light
                : Colors.background.primary.dark
            }
          />
        }
        rightIcon={
          <Bell
            size={24}
            color={
              isDarkMode
                ? Colors.background.primary.light
                : Colors.background.primary.dark
            }
          />
        }
      />
      {isAuthenticated ? (
        <PagerView
          ref={pagerRef}
          initialPage={0}
          onPageSelected={handlePageSelected}
          style={{ flex: 1 }}
          className="flex-1"
          orientation={isWeb ? "stack" : "horizontal"}
        >
          {pages.map((pageItem, index) => {
            return (
              <Feed
                feed={pageItem.feed}
                key={pageItem.feed}
                headerHeight={headerHeight}
                isFocused={page === index}
              />
            );
          })}
        </PagerView>
      ) : (
        <Feed
          feed={PUBLIC_FEED_DESCRIPTOR}
          key="public_feed"
          headerHeight={headerHeight}
          isFocused={true}
        />
      )}
    </View>
  );
}
