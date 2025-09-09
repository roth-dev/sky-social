import { atprotoClient } from "./atproto";
import { logger } from "@/utils/logger";

export interface AuthError {
  status?: number;
  message?: string;
  code?: string;
}

/**
 * Check if an error is authentication-related
 */
export function isAuthError(error: unknown): error is AuthError {
  const err = error as AuthError;

  return !!(
    err?.status === 401 ||
    err?.message?.includes("authentication") ||
    err?.message?.includes("unauthorized") ||
    err?.message?.includes("invalid token") ||
    err?.message?.includes("token expired") ||
    err?.code === "UNAUTHORIZED"
  );
}

/**
 * Handle authentication errors consistently
 */
export async function handleAuthError(
  error: unknown,
  context?: string
): Promise<boolean> {
  if (!isAuthError(error)) {
    return false;
  }

  const authError = error as AuthError;
  logger.warn(
    `Auth error in ${context || "unknown context"}:`,
    authError.message
  );

  // Only attempt refresh if we're currently authenticated
  if (atprotoClient.getIsAuthenticated()) {
    logger.log("Attempting session refresh due to auth error...");

    try {
      const refreshed = await atprotoClient.performSessionRefresh();

      if (refreshed) {
        logger.log("Session refreshed successfully");
        return true; // Error was handled successfully
      } else {
        logger.warn("Session refresh failed");
      }
    } catch (refreshError) {
      logger.error("Session refresh attempt failed:", refreshError);
    }
  }

  return false; // Error was not handled
}

/**
 * Wrapper for API calls that automatically handles auth errors
 */
export async function withAuthErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const handled = await handleAuthError(error, context);

    if (handled) {
      // Retry the operation once after successful refresh
      return await operation();
    }

    // Re-throw if not handled
    throw error;
  }
}
