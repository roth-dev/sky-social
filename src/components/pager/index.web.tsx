import React, {
  PropsWithChildren,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { View } from "../ui";

interface WebPagerProps {
  initialPage: number;
  scrollEnabled: boolean;
  onPageSelected: (index: number) => void;
  onPageScroll: () => void;
  // onPageScrollStateChanged: ()=> void,
  orientation: "horizontal" | "vertical";
  pageMargin: number;
}

type PageScrollState = "idle" | "dragging" | "settling";

// Minimal web mock for NativeSyntheticEvent
function createNativeSyntheticEvent<T>(nativeEvent: T): any {
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

export default function PagerView({
  children,
  initialPage = 0,
  scrollEnabled = true,
  onPageSelected,
  onPageScroll,
  // onPageScrollStateChanged,
  orientation = "horizontal",
  pageMargin = 0,
}: PropsWithChildren<WebPagerProps>) {
  const childs = React.Children.toArray(children);
  const [page, setPage] = useState(initialPage);
  const prevPageRef = useRef(page);

  // Handle initialPage prop changes
  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  // Callbacks for page change
  useEffect(() => {
    if (prevPageRef.current !== page && onPageSelected) {
      onPageSelected(createNativeSyntheticEvent({ position: page }));
    }
    prevPageRef.current = page;
  }, [page, onPageSelected]);

  // Simulate onPageScrollStateChanged
  // const setPagerState = useCallback(
  //   (state: PageScrollState) => {
  //     if (onPageScrollStateChanged) {
  //       onPageScrollStateChanged(
  //         createNativeSyntheticEvent({ pageScrollState: state })
  //       );
  //     }
  //   },
  //   [onPageScrollStateChanged]
  // );

  // useEffect(() => {
  //   if (onPageScroll) {
  //     onPageScroll(createNativeSyntheticEvent({ position: page, offset: 0 }));
  //   }
  // }, [page, onPageScroll]);

  const isHorizontal = orientation === "horizontal";
  const containerClass = isHorizontal
    ? "flex flex-row w-full h-full relative"
    : "flex flex-col w-full h-full relative";
  const pageStyle = isHorizontal
    ? { marginRight: pageMargin, width: "100%", height: "100%" }
    : { marginBottom: pageMargin, width: "100%", height: "100%" };

  return (
    <View className={containerClass}>
      <View className="flex-1 flex w-full">
        {childs.length > 0 && <div style={pageStyle}>{childs[page]}</div>}
      </View>
    </View>
  );
}
