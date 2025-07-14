// src/utils/errorUtils.ts

/**
 * Returns a user-friendly error message for AT Protocol errors.
 */
export function getErrorMessage(error: unknown): string {
  const err = error as { status?: number; message?: string };
  // Handle specific AT Protocol errors
  if (err.status) {
    switch (err.status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Authentication failed. Please log in again.";
      case 403:
        return "Access denied. You don't have permission to perform this action.";
      case 404:
        return "Content not found. It may have been deleted or moved.";
      case 408:
        return "Request timeout. Please check your connection and try again.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. The service is temporarily unavailable.";
      case 502:
      case 503:
      case 504:
        return "Service temporarily unavailable. Please try again in a few moments.";
      default:
        if (err.status >= 500) {
          return "Server error. Please try again later.";
        }
        break;
    }
  }

  // Handle specific error messages
  if (err.message) {
    if (err.message.includes("UpstreamFailure")) {
      return "Service temporarily unavailable. Please try again in a few moments.";
    }
    if (err.message.includes("network")) {
      return "Network error. Please check your internet connection.";
    }
    if (err.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    if (err.message.includes("authentication")) {
      return "Authentication error. Please log in again.";
    }
    if (
      err.message.includes("Profile not found") ||
      err.message.includes("Actor not found")
    ) {
      return "Profile not found. The user may not exist or may have changed their handle.";
    }
    if (err.message.includes("Invalid request")) {
      return "Invalid request. Please check your input and try again.";
    }
  }

  // Fallback to original error message or generic message
  return err.message || "An unexpected error occurred. Please try again.";
}
