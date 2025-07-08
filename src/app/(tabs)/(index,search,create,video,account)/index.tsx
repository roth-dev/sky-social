import { Header } from "@/components/Header";
import { Bell, UserCircle } from "lucide-react-native";
import { View } from "@/components/ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { Feed } from "@/components/Feed";
import { useState, useRef, useCallback, useMemo } from "react";
import PagerView from "@/components/pager";
import { useScrollStore } from "@/store/scrollStore";
import { useSharedValue } from "react-native-reanimated";
import type PagerViewType from "react-native-pager-view";
import HeaderTab from "@/components/home/HeaderTab";

export default function HomeScreen() {
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
    []
  );

  const handleTabPress = useCallback((idx: number) => {
    setPage(idx);
    indicatorIndex.value = idx;
    if (pagerRef.current) {
      pagerRef.current.setPage(idx);
    }
  }, []);
  const tabTitles = useMemo(() => ["For You", "Following"], []);
  return (
    <View className="flex-1 bg-white">
      <Header
        onHeightChange={setHeaderHeight}
        renderHeader={() => (
          <HeaderTab
            indicatorIndex={indicatorIndex}
            setPage={handleTabPress}
            page={page}
            tabTitles={tabTitles}
            tabLayouts={tabLayouts}
            setTabLayouts={setTabLayouts}
          />
        )}
        collapsible
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

      <PagerView
        ref={pagerRef}
        initialPage={0}
        // No need for onPageScroll for indicator
        onPageSelected={handlePageSelected}
        style={{ flex: 1 }}
        className="flex-1 "
      >
        <Feed
          // feed="public"
          key="forYou"
          isFocused={page === 0}
          headerHeight={headerHeight}
        />
        <Feed
          // fead="author"
          key="following"
          isFocused={page === 1}
          headerHeight={headerHeight}
        />
      </PagerView>
    </View>
  );
}
