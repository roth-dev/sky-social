import { useState, useEffect } from "react";
import { isWeb } from "@/platform";
import { getResponsiveMaxWidth } from "@/utils/style";

/**
 * Hook to get responsive max width that updates on window resize (web only)
 * @returns The current responsive max width in pixels
 */
export const useResponsiveWidth = (): number => {
  const [maxWidth, setMaxWidth] = useState(getResponsiveMaxWidth());

  // Handle window resize on web
  useEffect(() => {
    if (!isWeb) return;

    const handleResize = () => {
      setMaxWidth(getResponsiveMaxWidth());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return maxWidth;
};
