import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";

export function useFollowProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ did }: { did: string }) => {
      if (!did) {
        throw new Error("Invalid DID");
      }
      const result = await atprotoClient.followProfile(did);
      if (!result.success) {
        throw new Error(result.error || "Failed to follow profile");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestedFollows });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
