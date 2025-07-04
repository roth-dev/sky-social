import { useScrollStore } from "@/store/scrollStore";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

type ScrollDirection = "up" | "down";
const SCROLL_DIRECTION_THRESHOLD = 150;

export default function useScrollDirection(
  headerHeight: number = 0
): SharedValue<ScrollDirection> {
  const { scrollY } = useScrollStore();

  const prevY = useSharedValue(0);
  const lastDirection = useSharedValue<ScrollDirection>("up");

  const direction = useDerivedValue(() => {
    const diff = scrollY.value - prevY.value;

    if (Math.abs(diff) > SCROLL_DIRECTION_THRESHOLD + headerHeight) {
      if (diff > 0) {
        lastDirection.value = "down";
      } else {
        lastDirection.value = "up";
      }

      prevY.value = scrollY.value;
    }

    return lastDirection.value;
  });

  return direction;
}
