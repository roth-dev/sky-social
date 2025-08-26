import React, { useCallback, useRef } from "react";
import {
  Tabs,
  CollapsibleRef,
  MaterialTabBar,
} from "react-native-collapsible-tab-view";
import { Route, TabViewProps } from "./type";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";

export default function TabView({
  routes,
  onChange,
  onRefresh,
  headerHeight,
  refreshing = false,
  renderHeader,
}: TabViewProps) {
  const { colorScheme } = useSettings();
  const ref = useRef<CollapsibleRef>(null);

  const handleIndexChange = useCallback(
    (index: number) => {
      onChange?.({ key: routes[index].key, name: routes[index].name });
    },
    [onChange, routes]
  );

  const renderScene = useCallback(({ item }: { item: Route }) => {
    return (
      <Tabs.Tab label={item.name} name={item.name} key={item.key}>
        <item.component />
      </Tabs.Tab>
    );
  }, []);

  return (
    <Tabs.Container
      lazy
      ref={ref}
      renderHeader={renderHeader}
      allowHeaderOverscroll
      renderTabBar={(props) => (
        <MaterialTabBar
          {...props}
          scrollEnabled
          style={[
            styles.tabBar,
            { backgroundColor: Colors.background.primary[colorScheme] },
          ]}
          labelStyle={[
            styles.tabLabel,
            { color: Colors.inverted[colorScheme] },
          ]}
          contentContainerStyle={[styles.tabContentContainer]}
        />
      )}
      onIndexChange={handleIndexChange}
      headerHeight={headerHeight}
      headerContainerStyle={styles.container}
    >
      {routes.map((route) => renderScene({ item: route }))}
    </Tabs.Container>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 0,
    shadowRadius: 0,
    shadowOpacity: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  tabLabel: {
    fontSize: 16,
    marginHorizontal: 15,
    textAlign: "center",
    fontFamily: "KantumruyPro_500Medium",
  },
  tabBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabContentContainer: {
    padding: 8,
  },
});
