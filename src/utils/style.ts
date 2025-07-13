import { StyleProp } from "react-native";
import { Dimensions } from "react-native";
import { isWeb } from "@/platform";

export function mergeStyle<T>(
  base: StyleProp<T>,
  addedStyle: StyleProp<T>
): StyleProp<T> {
  if (Array.isArray(base)) {
    return base.concat([addedStyle]);
  }
  return [base, addedStyle];
}

const { width: screenWidth } = Dimensions.get("window");

/**
 * Calculate responsive max width for content that respects desktop layout constraints
 * @returns The maximum width in pixels for the current screen size
 */
export const getResponsiveMaxWidth = (): number => {
  if (isWeb) {
    // On web, check if we're in desktop mode (lg breakpoint is 1024px)
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      // Desktop: content is constrained to max-w-lg (672px) with padding
      return Math.min(672 - 32, screenWidth - 32);
    }
  }
  // Mobile or smaller screens: use full width minus padding
  return screenWidth - 32;
};
