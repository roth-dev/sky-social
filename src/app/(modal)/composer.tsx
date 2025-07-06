import React from "react";
import { Stack, useRouter } from "expo-router";
import { Composer } from "@/components/composer";
import { useCreatePost } from "@/lib/queries";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "react-native";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function ComposerModal() {
  const router = useRouter();
  const { colorScheme } = useSettings();
  const { isAuthenticated } = useAuth();
  const createPostMutation = useCreatePost();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  const handleClose = () => {
    router.back();
  };

  const handlePost = async ({
    text,
    images,
    video,
  }: {
    text: string;
    images: string[];
    video: string | null;
  }) => {
    // TODO: Implement media upload logic if backend supports it
    await createPostMutation.mutateAsync({ text /*, images, video */ });
    Alert.alert("Success", "Post created successfully!");
  };

  if (!isAuthenticated) return null;
  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: Colors.background.primary[colorScheme],
          },
          headerRight: () => (
            <Button
              title={"Post"}
              onPress={() => {}}
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
                // disabled={!canPost || isPosting}
                size="medium"
              />
            );
          },
        }}
      />
      <KeyboardProvider>
        <Composer onClose={handleClose} onPost={handlePost} />
      </KeyboardProvider>
    </>
  );
}
