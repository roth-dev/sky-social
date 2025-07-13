import React, { memo } from "react";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { isAndroid } from "@/platform";
import { useScrollStore } from "@/store/scrollStore";
import { FlatList, RefreshControl, ViewToken } from "react-native";
import Animated, {
  FlatListPropsWithLayout,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

export type ListRef = React.ForwardedRef<FlatList<unknown>>;

export type ListProps<ItemT = unknown> = Omit<
  FlatListPropsWithLayout<ItemT>,
  | "contentOffset" // Pass headerOffset instead.
  | "progressViewOffset" // Can't be an animated value
> & {
  headerOffset?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  onItemSeen?: (item: ItemT) => void;
  onViewableItemsChangedFull?: (items: ItemT[]) => void;
  onScrollStateChange?: (isScrolling: boolean) => void;
  desktopFixedHeight?: number | boolean;
  // Web only prop to contain the scroll to the container rather than the window
  disableFullWindowScroll?: boolean;
  progressViewOffset?: number;
  useScrollDetector?: boolean;
};

let List = React.forwardRef<ListRef, ListProps>(
  (
    {
      style,
      onItemSeen,
      onViewableItemsChangedFull,
      onScrollStateChange,
      refreshing,
      onRefresh,
      headerOffset,
      progressViewOffset,
      useScrollDetector,
      automaticallyAdjustsScrollIndicatorInsets = false,
      ...props
    },
    ref
  ) => {
    const { colorScheme } = useSettings();
    const { scrollY } = useScrollStore();

    const scrollHandler = useAnimatedScrollHandler({
      onScroll(e) {
        if (useScrollDetector) {
          scrollY.value = e.contentOffset.y;
        }
      },
    });

    const [onViewableItemsChanged, viewabilityConfig] = React.useMemo(() => {
      if (!onItemSeen && !onViewableItemsChangedFull) {
        return [undefined, undefined];
      }
      return [
        (info: {
          viewableItems: Array<ViewToken>;
          changed: Array<ViewToken>;
        }) => {
          if (onViewableItemsChangedFull) {
            onViewableItemsChangedFull(info.viewableItems.map((v) => v.item));
          }
          if (onItemSeen) {
            for (const item of info.changed) {
              if (item.isViewable) {
                onItemSeen(item.item);
              }
            }
          }
        },
        {
          itemVisiblePercentThreshold: 40,
          minimumViewTime: 0.5e3,
        },
      ];
    }, [onItemSeen, onViewableItemsChangedFull]);

    let refreshControl;
    if (refreshing !== undefined || onRefresh !== undefined) {
      refreshControl = (
        <RefreshControl
          key={Colors.inverted[colorScheme]}
          refreshing={refreshing ?? false}
          onRefresh={onRefresh}
          tintColor={Colors.inverted[colorScheme]}
          titleColor={Colors.inverted[colorScheme]}
          progressViewOffset={progressViewOffset ?? headerOffset}
        />
      );
    }

    let contentOffset;
    if (headerOffset != null) {
      contentOffset = { x: 0, y: headerOffset * -1 };
    }

    return (
      <Animated.FlatList
        showsVerticalScrollIndicator={!isAndroid} // overridable
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        {...props}
        onScroll={scrollHandler}
        onScrollBeginDrag={() => onScrollStateChange?.(true)}
        onScrollEndDrag={() => onScrollStateChange?.(false)}
        onMomentumScrollBegin={() => onScrollStateChange?.(true)}
        onMomentumScrollEnd={() => onScrollStateChange?.(false)}
        automaticallyAdjustsScrollIndicatorInsets={
          automaticallyAdjustsScrollIndicatorInsets
        }
        scrollIndicatorInsets={{
          top: headerOffset,
          right: 1,
          ...props.scrollIndicatorInsets,
        }}
        indicatorStyle={colorScheme === "dark" ? "white" : "black"}
        contentOffset={contentOffset}
        refreshControl={refreshControl}
        scrollEventThrottle={1}
        style={style}
        // @ts-expect-error Animated.FlatList ref type is wrong -sfn
        ref={ref}
      />
    );
  }
);

List.displayName = "List";

List = memo(List);

export { List };
