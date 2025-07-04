import { isAndroid } from "@/platform";
import React, { memo, createContext, useContext, useMemo } from "react";
import { FlatList, ViewToken } from "react-native";
import Animated, {
  FlatListPropsWithLayout,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { ScrollHandlers } from "react-native-reanimated";

const ScrollContext = createContext<ScrollHandlers<any>>({
  onBeginDrag: undefined,
  onEndDrag: undefined,
  onScroll: undefined,
  onMomentumEnd: undefined,
});

export function useScrollHandlers(): ScrollHandlers<any> {
  return useContext(ScrollContext);
}

type ProviderProps = { children: React.ReactNode } & ScrollHandlers<any>;

// Note: this completely *overrides* the parent handlers.
// It's up to you to compose them with the parent ones via useScrollHandlers() if needed.
export function ScrollProvider({
  children,
  onBeginDrag,
  onEndDrag,
  onScroll,
  onMomentumEnd,
}: ProviderProps) {
  const handlers = useMemo(
    () => ({
      onBeginDrag,
      onEndDrag,
      onScroll,
      onMomentumEnd,
    }),
    [onBeginDrag, onEndDrag, onScroll, onMomentumEnd]
  );
  return (
    <ScrollContext.Provider value={handlers}>{children}</ScrollContext.Provider>
  );
}

export type ListRef = React.ForwardedRef<FlatList<any>>;

const SCROLLED_DOWN_LIMIT = 200;

export type ListProps<ItemT = any> = Omit<
  FlatListPropsWithLayout<ItemT>,
  | "onMomentumScrollBegin" // Use ScrollContext instead.
  | "onMomentumScrollEnd" // Use ScrollContext instead.
  | "onScroll" // Use ScrollContext instead.
  | "onScrollBeginDrag" // Use ScrollContext instead.
  | "onScrollEndDrag" // Use ScrollContext instead.
  | "contentOffset" // Pass headerOffset instead.
  | "progressViewOffset" // Can't be an animated value
> & {
  onScrolledDownChange?: (isScrolledDown: boolean) => void;
  headerOffset?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  onItemSeen?: (item: ItemT) => void;
  desktopFixedHeight?: number | boolean;
  // Web only prop to contain the scroll to the container rather than the window
  disableFullWindowScroll?: boolean;
};

let List = React.forwardRef<ListRef, ListProps>(
  ({ onItemSeen, onScrolledDownChange, ...props }, ref) => {
    const isScrolledDown = useSharedValue(false);

    function handleScrolledDownChange(didScrollDown: boolean) {
      onScrolledDownChange?.(didScrollDown);
    }

    // Intentionally destructured outside the main thread closure.
    // See https://github.com/bluesky-social/social-app/pull/4108.
    const {
      onBeginDrag: onBeginDragFromContext,
      onEndDrag: onEndDragFromContext,
      onScroll: onScrollFromContext,
      onMomentumEnd: onMomentumEndFromContext,
    } = useScrollHandlers();

    const scrollHandler = useAnimatedScrollHandler({
      onBeginDrag(e, ctx) {
        onBeginDragFromContext?.(e, ctx);
      },
      onEndDrag(e, ctx) {
        onEndDragFromContext?.(e, ctx);
      },
      onScroll(e, ctx) {
        onScrollFromContext?.(e, ctx);

        const didScrollDown = e.contentOffset.y > SCROLLED_DOWN_LIMIT;
        if (isScrolledDown.get() !== didScrollDown) {
          isScrolledDown.set(didScrollDown);
          if (onScrolledDownChange != null) {
            runOnJS(handleScrolledDownChange)(didScrollDown);
          }
        }
      },
      // Note: adding onMomentumBegin here makes simulator scroll
      // lag on Android. So either don't add it, or figure out why.
      onMomentumEnd(e, ctx) {
        onMomentumEndFromContext?.(e, ctx);
      },
    });

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
      <Animated.FlatList
        showsVerticalScrollIndicator={!isAndroid} // overridable
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        {...props}
        onScroll={scrollHandler}
        scrollEventThrottle={1}
        // @ts-expect-error Animated.FlatList ref type is wrong -sfn
        ref={ref}
      />
    );
  }
);

List.displayName = "List";

List = memo(List);

export { List };
