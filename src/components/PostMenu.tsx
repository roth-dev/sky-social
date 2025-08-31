import React, { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  Globe,
  Copy,
  UserX,
  VolumeX,
  Flag,
  EyeOff,
  Share,
  Link,
} from "lucide-react-native";
import { DropDownMenuAction } from "./dropdown/type";
import { t } from "@lingui/core/macro";
import { useModerationAPI } from "@/hooks/useModerationAPI";
import { translationService, TranslationResult } from "@/lib/translator";
import { ATPost } from "@/types/atproto";

interface PostMenuProps {
  post: ATPost;
  onCopyToClipboard: (text: string) => Promise<void>;
  onTranslationResult?: (result: TranslationResult | null) => void;
  onToggleTranslation?: (show: boolean) => void;
}

export function usePostMenuActions({
  post,
  onCopyToClipboard,
  onTranslationResult,
  onToggleTranslation,
}: PostMenuProps) {
  const { blockUser, muteUser, reportContent, hidePost } = useModerationAPI();

  // Translation state
  const [translationResult, setTranslationResult] =
    useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // Handle translation result changes
  React.useEffect(() => {
    onTranslationResult?.(translationResult);
  }, [translationResult, onTranslationResult]);

  React.useEffect(() => {
    onToggleTranslation?.(showTranslation);
  }, [showTranslation, onToggleTranslation]);

  const handleTranslate = useCallback(async () => {
    if (!post.record.text?.trim()) {
      Alert.alert(t`Error`, t`No text to translate`);
      return;
    }

    if (isTranslating) return;

    try {
      setIsTranslating(true);

      // Get user's preferred language
      const targetLanguage = translationService.getUserLanguage();

      // First detect the source language
      const detection = await translationService.detectLanguage(
        post.record.text
      );

      if (
        detection &&
        !translationService.isTranslationNeeded(
          detection.language,
          targetLanguage
        )
      ) {
        Alert.alert(
          t`Translation not needed`,
          t`This post appears to already be in your language (${targetLanguage})`
        );
        setIsTranslating(false);
        return;
      }

      // Perform translation
      const result = await translationService.translateText(
        post.record.text,
        targetLanguage,
        detection?.language
      );

      if (result.success) {
        setTranslationResult(result);
        setShowTranslation(true);
      } else {
        Alert.alert(
          t`Translation Error`,
          result.error || t`Failed to translate post. Please try again.`
        );
      }
    } catch (error) {
      console.error("Translation error:", error);
      Alert.alert(
        t`Translation Error`,
        t`Failed to translate post. Please check your internet connection and try again.`
      );
    } finally {
      setIsTranslating(false);
    }
  }, [post.record.text, isTranslating]);

  const handleCopyPostText = useCallback(() => {
    onCopyToClipboard(post.record.text);
  }, [onCopyToClipboard, post]);

  const handleCopyLink = useCallback(() => {
    const postUrl = `https://skysocial.app/profile/${
      post.author.handle
    }/post/${encodeURIComponent(post.uri)}`;
    onCopyToClipboard(postUrl);
  }, [onCopyToClipboard, post]);

  const handleShare = useCallback(() => {
    const postUrl = `https://skysocial.app/profile/${
      post.author.handle
    }/post/${encodeURIComponent(post.uri)}`;
    if (Platform.OS === "web" && navigator.share) {
      navigator
        .share({
          title: `Post by @${post.author.handle}`,
          text: post.record.text,
          url: postUrl,
        })
        .catch(console.error);
    } else {
      onCopyToClipboard(postUrl);
    }
  }, [onCopyToClipboard, post]);

  const handleBlockUser = useCallback(async () => {
    Alert.alert(
      t`Block @${post.author.handle}?`,
      t`They will no longer be able to follow you or see your posts. You will not see their posts or be notified when they follow you.`,
      [
        { text: t`Cancel`, style: "cancel" },
        {
          text: t`Block`,
          style: "destructive",
          onPress: async () => {
            try {
              const success = await blockUser(post.author.did);
              if (success) {
                Alert.alert(
                  t`Blocked`,
                  t`@${post.author.handle} has been blocked.`
                );
              } else {
                Alert.alert(
                  t`Error`,
                  t`Failed to block user. Please try again.`
                );
              }
            } catch (error) {
              console.error("Block user error:", error);
              Alert.alert(t`Error`, t`Failed to block user. Please try again.`);
            }
          },
        },
      ]
    );
  }, [blockUser, post.author]);

  const handleMuteUser = useCallback(async () => {
    Alert.alert(
      t`Mute @${post.author.handle}?`,
      t`You won't see their posts in your timeline, but they can still follow and interact with you.`,
      [
        { text: t`Cancel`, style: "cancel" },
        {
          text: t`Mute`,
          onPress: async () => {
            try {
              const success = await muteUser(post.author.did);
              if (success) {
                Alert.alert(
                  t`Muted`,
                  t`@${post.author.handle} has been muted.`
                );
              } else {
                Alert.alert(
                  t`Error`,
                  t`Failed to mute user. Please try again.`
                );
              }
            } catch (error) {
              console.error("Mute user error:", error);
              Alert.alert(t`Error`, t`Failed to mute user. Please try again.`);
            }
          },
        },
      ]
    );
  }, [muteUser, post.author]);

  const handleHidePost = useCallback(async () => {
    Alert.alert(
      t`Hide this post?`,
      t`This post will be hidden from your timeline. You can still see it by visiting the profile directly.`,
      [
        { text: t`Cancel`, style: "cancel" },
        {
          text: t`Hide`,
          onPress: async () => {
            try {
              const success = await hidePost(post.uri);
              if (success) {
                Alert.alert(
                  t`Hidden`,
                  t`Post has been hidden from your timeline.`
                );
              } else {
                Alert.alert(
                  t`Error`,
                  t`Failed to hide post. Please try again.`
                );
              }
            } catch (error) {
              console.error("Hide post error:", error);
              Alert.alert(t`Error`, t`Failed to hide post. Please try again.`);
            }
          },
        },
      ]
    );
  }, [hidePost, post]);

  const handleReportPost = useCallback(() => {
    Alert.alert(t`Report this post?`, t`What's the issue with this post?`, [
      { text: t`Cancel`, style: "cancel" },
      {
        text: t`Spam`,
        onPress: async () => {
          try {
            const success = await reportContent(
              post.uri,
              post.cid,
              "Spam content",
              "com.atproto.moderation.defs#reasonSpam"
            );
            if (success) {
              Alert.alert(
                t`Reported`,
                t`Thank you for your report. We'll review it soon.`
              );
            } else {
              Alert.alert(
                t`Error`,
                t`Failed to submit report. Please try again.`
              );
            }
          } catch (error) {
            console.error("Report spam error:", error);
            Alert.alert(
              t`Error`,
              t`Failed to submit report. Please try again.`
            );
          }
        },
      },
      {
        text: t`Harassment`,
        onPress: async () => {
          try {
            const success = await reportContent(
              post.uri,
              post.cid,
              "Harassment or abuse",
              "com.atproto.moderation.defs#reasonMisleading"
            );
            if (success) {
              Alert.alert(
                t`Reported`,
                t`Thank you for your report. We'll review it soon.`
              );
            } else {
              Alert.alert(
                t`Error`,
                t`Failed to submit report. Please try again.`
              );
            }
          } catch (error) {
            console.error("Report harassment error:", error);
            Alert.alert(
              t`Error`,
              t`Failed to submit report. Please try again.`
            );
          }
        },
      },
      {
        text: t`Other`,
        onPress: async () => {
          try {
            const success = await reportContent(
              post.uri,
              post.cid,
              "Violates community guidelines",
              "com.atproto.moderation.defs#reasonOther"
            );
            if (success) {
              Alert.alert(
                t`Reported`,
                t`Thank you for your report. We'll review it soon.`
              );
            } else {
              Alert.alert(
                t`Error`,
                t`Failed to submit report. Please try again.`
              );
            }
          } catch (error) {
            console.error("Report other error:", error);
            Alert.alert(
              t`Error`,
              t`Failed to submit report. Please try again.`
            );
          }
        },
      },
    ]);
  }, [reportContent, post]);

  const toggleTranslation = useCallback(() => {
    setShowTranslation(!showTranslation);
  }, [showTranslation]);

  const postMenuActions: DropDownMenuAction[] = useMemo(
    () => [
      {
        label: isTranslating ? t`Translating...` : t`Translate`,
        onPress: handleTranslate,
        disabled: isTranslating,
        web: {
          icon: <Globe size={16} />,
        },
      },
      {
        label: t`Copy post text`,
        onPress: handleCopyPostText,
        web: {
          icon: <Copy size={16} />,
        },
      },
      {
        label: t`Copy link to post`,
        onPress: handleCopyLink,
        web: {
          icon: <Link size={16} />,
        },
      },
      {
        label: t`Share post`,
        onPress: handleShare,
        web: {
          icon: <Share size={16} />,
        },
      },
      {
        label: t`Hide this post`,
        onPress: handleHidePost,
        web: {
          icon: <EyeOff size={16} />,
        },
      },
      {
        label: t`Mute @${post.author.displayName ?? post.author.handle}`,
        onPress: handleMuteUser,
        web: {
          icon: <VolumeX size={16} />,
        },
      },
      {
        label: t`Block @${post.author.displayName ?? post.author.handle}`,
        onPress: handleBlockUser,
        web: {
          icon: <UserX size={16} />,
        },
      },
      {
        label: t`Report post`,
        onPress: handleReportPost,
        web: {
          icon: <Flag size={16} />,
        },
      },
    ],
    [
      handleCopyPostText,
      handleCopyLink,
      handleShare,
      handleHidePost,
      handleMuteUser,
      handleBlockUser,
      handleReportPost,
      handleTranslate,
      post.author.handle,
      post.author.displayName,
      isTranslating,
    ]
  );

  return {
    postMenuActions,
    translationResult,
    showTranslation,
    toggleTranslation,
    isTranslating,
  };
}
