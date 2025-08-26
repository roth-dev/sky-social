import React, { memo } from "react";
import { Tabs } from "react-native-collapsible-tab-view";
import { ListProps, ListRef } from "../list";
import { useSettings } from "@/contexts/SettingsContext";
import { ViewToken } from "react-native";

let TabList = React.forwardRef<ListRef, ListProps>(
  ({ onItemSeen, ...props }, ref) => {
    const { colorScheme } = useSettings();

    const [onViewableItemsChanged, viewabilityConfig] = React.useMemo(() => {
      if (!onItemSeen) {
        return [undefined, undefined];
      }
      return [
        (info: {
          viewableItems: Array<ViewToken>;
          changed: Array<ViewToken>;
        }) => {
          for (const item of info.changed) {
            if (item.isViewable) {
              onItemSeen(item.item);
            }
          }
        },
        {
          itemVisiblePercentThreshold: 40,
          minimumViewTime: 0.5e3,
        },
      ];
    }, [onItemSeen]);

    return (
      <Tabs.FlashList
        {...props}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        indicatorStyle={colorScheme === "dark" ? "white" : "black"}
        scrollEventThrottle={1}
        ref={ref}
      />
    );
  }
);

TabList.displayName = "TabList";

TabList = memo(TabList);

export default TabList;
