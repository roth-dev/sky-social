import Animated, {
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { HStack, Text, VStack } from "../ui";
import { cn } from "@/lib/utils";
import { Pressable } from "react-native";
import { isMobileWeb, isNative } from "@/platform";

interface HeaderTabProps {
  indicatorIndex: SharedValue<number>;
  setPage: (idx: number) => void;
  page: number;
  tabTitles: string[];
  tabLayouts: { width: number; x: number }[];
  setTabLayouts: React.Dispatch<
    React.SetStateAction<{ width: number; x: number }[]>
  >;
}

export default function HeaderTab({
  indicatorIndex,
  setPage,
  tabTitles,
  tabLayouts,
  setTabLayouts,
}: HeaderTabProps) {
  const indicatorStyle = useAnimatedStyle(() => {
    if (tabLayouts.length !== tabTitles.length) return {};
    const idx = indicatorIndex.value as number;
    const x = tabLayouts[idx]?.x ?? 0;
    const width = tabLayouts[idx]?.width ?? 0;
    return {
      left: withTiming(x, { duration: 200 }),
      width: withTiming(width, { duration: 200 }),
    };
  }, [tabLayouts]);

  return (
    <VStack
      darkColor="none"
      className={cn("relative", isMobileWeb || isNative ? "mt-3" : "mt-4")}
      style={{ position: "relative" }}
    >
      <HStack darkColor="none" className="items-center justify-between">
        {tabTitles.map((title, idx) => (
          <Pressable
            key={title}
            className="flex-1 items-center"
            onPress={() => setPage(idx)}
            onLayout={(e) => {
              const { width, x } = e.nativeEvent.layout;
              setTabLayouts((prev) => {
                const next = [...prev];
                next[idx] = { width, x };
                return next;
              });
            }}
          >
            <Text font="bold" className="flex-1 text-center">
              {title}
            </Text>
          </Pressable>
        ))}
      </HStack>
      {tabLayouts.length === tabTitles.length && (
        <Animated.View
          style={[
            {
              position: "absolute",
              height: 3,
              backgroundColor: "#3b82f6",
              borderRadius: 1.5,
              bottom: -10,
            },
            indicatorStyle,
          ]}
        />
      )}
    </VStack>
  );
}
