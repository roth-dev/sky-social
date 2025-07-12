import React, {
  PropsWithChildren,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import { View } from "../ui";
import { ViewStyle } from "react-native";
import { cn } from "@/lib/utils";

type PagerViewRef = {
  setPage: (page: number) => void;
};

interface WebPagerProps {
  initialPage: number;
  scrollEnabled: boolean;
  onPageSelected: (e: unknown) => void;
  onPageScroll: () => void;
  // onPageScrollStateChanged: ()=> void,
  orientation: "horizontal" | "vertical" | "stack";
  pageMargin: number;
}

// Minimal web mock for NativeSyntheticEvent
function createNativeSyntheticEvent<T>(nativeEvent: T): unknown {
  return {
    nativeEvent,
    // Add minimal event fields if needed
    bubbles: false,
    cancelable: false,
    currentTarget: null,
    defaultPrevented: false,
    eventPhase: 3,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    persist: () => {},
    preventDefault: () => {},
    stopPropagation: () => {},
    target: null,
    timeStamp: Date.now(),
    type: "",
  };
}

const PagerView = forwardRef<PagerViewRef, PropsWithChildren<WebPagerProps>>(
  (
    {
      children,
      initialPage = 0,
      onPageSelected,
      orientation = "horizontal",
      pageMargin = 0,
    },
    ref
  ) => {
    const childs = React.Children.toArray(children);
    const [page, setPage] = useState(initialPage);
    const prevPageRef = useRef(page);
    const [visitedPages, setVisitedPages] = useState<Set<number>>(
      new Set([initialPage])
    );

    useImperativeHandle(ref, () => ({
      setPage,
    }));

    // Handle initialPage prop changes
    useEffect(() => {
      setPage(initialPage);
      setVisitedPages(new Set([initialPage]));
    }, [initialPage]);

    // Callbacks for page change
    useEffect(() => {
      if (prevPageRef.current !== page && onPageSelected) {
        onPageSelected(createNativeSyntheticEvent({ position: page }));
      }
      prevPageRef.current = page;
      setVisitedPages((prev) => {
        if (prev.has(page)) return prev;
        const next = new Set(prev);
        next.add(page);
        return next;
      });
    }, [page, onPageSelected]);

    const isHorizontal = orientation === "horizontal";
    const containerClass = isHorizontal
      ? "relative w-full h-full flex flex-row"
      : "relative w-full h-full flex flex-col";

    const pageStyle = useMemo(
      () =>
        isHorizontal
          ? { marginRight: pageMargin, width: "100%", height: "100%" }
          : { marginBottom: pageMargin, width: "100%", height: "100%" },
      [isHorizontal, pageMargin]
    );

    // Only the active page is visible, but all remain mounted
    const renderScene = useCallback(() => {
      return childs.map((child, index) => {
        const isActive = index === page;
        const isVisited = visitedPages.has(index);
        return (
          <View
            key={index}
            className={cn(
              orientation === "stack"
                ? "absolute w-full h-full top-0 left-0"
                : "w-full"
            )}
            style={
              {
                display: isActive ? "flex" : "none",
                ...pageStyle,
              } as ViewStyle
            }
          >
            {isActive || isVisited ? child : null}
          </View>
        );
      });
    }, [childs, page, pageStyle, orientation, visitedPages]);

    return (
      <View className={containerClass} style={{ position: "relative" }}>
        {renderScene()}
      </View>
    );
  }
);

PagerView.displayName = "PagerView";

export default PagerView;
