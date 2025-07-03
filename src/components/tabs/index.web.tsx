import { ScrollView, RefreshControl } from "react-native";
import { View } from "../ui";
import { StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import PagerView from "../pager";
import { TabViewProps } from "./type";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import TabBarItem from "./TabBarItem";

export default function TabView({
  routes,
  onChange,
  onRefresh,
  refreshing = false,
  renderHeader,
  renderTabBar,
}: TabViewProps) {
  const { colorScheme } = useSettings();
  const [activeTab, setActiveTab] = useState<number>(0);

  // Determine sticky index for tab bar
  const tabBarStickyIndex = renderHeader ? [1] : undefined;

  const handleChangeTab = useCallback(
    (tab: Omit<TabViewProps["routes"][number], "component">, index: number) => {
      onChange?.(tab);
      setActiveTab(index);
    },
    []
  );

  const renderCompnent = useCallback(() => {
    return routes.map((route) => {
      const Comp = route.component;
      return <Comp key={route.key} />;
    });
  }, [routes]);

  const renderTabBarItems = useCallback(() => {
    if (renderTabBar) {
      return renderTabBar({
        activeTab,
        setActiveTab,
      });
    }
    return routes.map((tab, index) => {
      const isActive = activeTab === index;
      return (
        <TabBarItem
          key={index}
          onPress={() => handleChangeTab(tab, index)}
          active={isActive}
          title={tab.name}
        />
      );
    });
  }, [routes, activeTab]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={tabBarStickyIndex}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderHeader?.()}
      <View className="flex-0 bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
          style={[
            styles.tabBarContainer,
            {
              borderBottomColor: Colors.border[colorScheme],
            },
          ]}
        >
          {renderTabBarItems()}
        </ScrollView>
      </View>
      <PagerView initialPage={activeTab} style={{ flex: 1 }}>
        {renderCompnent()}
      </PagerView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBar: {
    flex: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginRight: 8,
  },
  activeTabItem: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 2,
  },
  activeTabText: {
    color: Colors.primary,
  },
  tabContentContainer: {
    flex: 1,
    minHeight: 400,
  },
  tabItemPlaceholder: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    marginRight: 8,
  },
  tabTextPlaceholder: {
    width: 60,
    height: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginBottom: 4,
  },
  tabCountPlaceholder: {
    width: 20,
    height: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },
});
