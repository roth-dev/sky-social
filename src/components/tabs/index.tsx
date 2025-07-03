import React, { useState, useCallback, useRef } from "react";
import {
  Tabs,
  TabBarProps,
  CollapsibleRef,
} from "react-native-collapsible-tab-view";
import { Route, TabViewProps } from "./type";
import { HStack } from "../ui";
import TabBarItem from "./TabBarItem";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";

function TabBar(props: TabBarProps<string>) {
  const { colorScheme } = useSettings();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <HStack
      style={{
        borderBottomColor: Colors.border[colorScheme],
        borderBottomWidth: 1,
      }}
    >
      {props.tabNames.map((tab, index) => {
        return (
          <TabBarItem
            key={index}
            onPress={() => {
              setActiveTab(index);
              props.onTabPress(tab);
            }}
            active={index === activeTab}
            title={tab}
          />
        );
      })}
    </HStack>
  );
}
export default function TabView({
  routes,
  onChange,
  onRefresh,
  refreshing = false,
  renderHeader,
}: TabViewProps) {
  const ref = useRef<CollapsibleRef>(null);

  const handleIndexChange = useCallback((index: number) => {
    onChange?.({ key: routes[index].key, name: routes[index].name });
  }, []);

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
        <TabBar
          {...props}
          onTabPress={(name) => {
            if (!ref.current) return;
            ref.current?.jumpToTab(name);
          }}
        />
      )}
      onIndexChange={handleIndexChange}
      headerHeight={renderHeader ? 200 : 0}
      headerContainerStyle={{
        elevation: 0,
        shadowRadius: 0,
        shadowOpacity: 0,
        shadowOffset: {
          width: 0,
          height: 0,
        },
      }}
    >
      {routes.map((route) => renderScene({ item: route }))}
    </Tabs.Container>
  );
}
