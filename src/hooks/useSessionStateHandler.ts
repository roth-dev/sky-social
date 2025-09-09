import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { atprotoClient } from "@/lib/atproto";
import { logger } from "@/utils/logger";

/**
 * Hook to handle session validation when app state changes
 */
export function useSessionStateHandler() {
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // App became active, validate session
        if (atprotoClient.getIsAuthenticated()) {
          logger.log("App became active, validating session...");
          const isValid = await atprotoClient.validateSession();

          if (!isValid) {
            logger.warn("Session validation failed after app became active");
            // Don't auto-logout, let the next API call handle it
          } else {
            logger.log("Session validated successfully");
          }
        }
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Cleanup subscription
    return () => {
      subscription?.remove();
    };
  }, []);
}
