import { useSettings } from "@/contexts/SettingsContext";
import useScrollDirection from "./useScrollDirection";
import { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Colors } from "@/constants/colors";

export default function useAnimatedBottomTab() {
  const { colorScheme } = useSettings();
  const direction = useScrollDirection();
  const animatedStyle = useAnimatedStyle(() => ({
    bottom: withTiming(direction.value === "down" ? -100 : 0, {
      duration: 100,
    }),
  }));
  return {
    animatedStyle,
    backgroundColor:
      colorScheme === "dark" ? Colors.background.primary[colorScheme] : "white",
  };
}
