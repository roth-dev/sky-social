import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError } from "@/lib/queries";

export function useUnfollowProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ followUri }: { followUri: string }) => {
      if (!followUri) {
        throw new Error("Invalid follow URI");
      }
      const result = await atprotoClient.unfollowProfile(followUri);
      if (!result.success) {
        throw new Error(result.error || "Failed to unfollow profile");
      }
      return result.success;
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
  });
}
