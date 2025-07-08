import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atprotoClient } from "@/lib/atproto";
import { queryKeys, handleQueryError, retryDelay } from "@/lib/queries";

export interface ReplyInput {
  text: string;
  parentUri: string;
  parentCid: string;
  rootUri: string;
  rootCid: string;
}
export function useCreateReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      text,
      parentUri,
      parentCid,
      rootUri,
      rootCid,
    }: ReplyInput) => {
      if (!text || text.trim().length === 0) {
        throw new Error("Reply text cannot be empty");
      }
      const result = await atprotoClient.createReply(
        text,
        parentUri,
        parentCid,
        rootUri,
        rootCid
      );
      if (!result.success) {
        throw new Error(result.error || "Failed to create reply");
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.postThread(variables.rootUri),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return handleQueryError(error);
    },
    retryDelay,
  });
}
