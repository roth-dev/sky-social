import React from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Composer } from "@/components/composer";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ATPost } from "@/types/atproto";
import { useCreatePost, useCreateReply } from "@/hooks/mutation";

export default function ComposerModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    replyTo?: string;
    parentUri?: string;
    parentCid?: string;
    rootUri?: string;
    rootCid?: string;
  }>();
  const { colorScheme } = useSettings();
  const { isAuthenticated } = useAuth();
  const createPostMutation = useCreatePost();
  const createReplyMutation = useCreateReply();

  const [canPost, setCanPost] = React.useState(false);
  const [isPosting, setIsPosting] = React.useState(false);
  const [triggerPost, setTriggerPost] = React.useState<(() => void) | null>(
    null
  );

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const handleClose = () => {
    router.back();
  };

  const handlePostStateChange = React.useCallback(
    (state: { canPost: boolean; isPosting: boolean }) => {
      setCanPost(state.canPost);
      setIsPosting(state.isPosting);
    },
    []
  );

  const handlePostTrigger = React.useCallback((trigger: () => void) => {
    setTriggerPost(() => trigger);
  }, []);

  const handleHeaderPost = React.useCallback(() => {
    if (canPost && triggerPost && !isPosting) {
      triggerPost();
    }
  }, [canPost, triggerPost, isPosting]);

  // Parse reply data if available
  const replyToPost = React.useMemo(() => {
    if (params.replyTo) {
      try {
        return JSON.parse(decodeURIComponent(params.replyTo)) as ATPost;
      } catch (error) {
        console.error("Failed to parse reply data:", error);
        return null;
      }
    }
    return null;
  }, [params.replyTo]);

  const isReply = !!replyToPost;

  const handlePost = async ({
    text,
    images,
    video,
  }: {
    text: string;
    images: string[];
    video: string | null;
  }) => {
    try {
      if (isReply && replyToPost) {
        // Create reply
        await createReplyMutation.mutateAsync({
          text,
          parentUri: params.parentUri || replyToPost.uri,
          parentCid: params.parentCid || replyToPost.cid,
          rootUri: params.rootUri || replyToPost.uri,
          rootCid: params.rootCid || replyToPost.cid,
        });
      } else {
        // Create regular post
        // TODO: Implement media upload logic if backend supports it
        await createPostMutation.mutateAsync({ text /*, images, video */ });
      }
      // Close modal after successful posting
      router.back();
    } catch {
      Dialog.show(
        "Error",
        isReply ? "Failed to post reply" : "Failed to create post"
      );
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: isReply ? "Reply" : "New Post",
          headerStyle: {
            backgroundColor: Colors.background.primary[colorScheme],
          },
          headerRight: () => (
            <Button
              title={
                isPosting
                  ? isReply
                    ? "Replying..."
                    : "Posting..."
                  : isReply
                  ? "Reply"
                  : "Post"
              }
              onPress={handleHeaderPost}
              disabled={!canPost || isPosting}
              shape="round"
              variant="primary"
              size="medium"
            />
          ),
          headerLeft: () => {
            return (
              <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="ghost"
                size="medium"
              />
            );
          },
        }}
      />
      <KeyboardProvider>
        <Composer
          onClose={handleClose}
          onPost={handlePost}
          replyTo={replyToPost ? { post: replyToPost } : undefined}
          onPostStateChange={handlePostStateChange}
          onPostTrigger={handlePostTrigger}
        />
      </KeyboardProvider>
    </>
  );
}
