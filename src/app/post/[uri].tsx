import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Header } from "@/components/Header";
import { Post } from "@/components/Post";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePostThread,
  useCreateReply,
  useLikePost,
  useUnlikePost,
  useRepost,
  useDeleteRepost,
} from "@/lib/queries";
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  Repeat2,
  Share,
} from "lucide-react-native";
import { Text, View } from "@/components/ui";

export default function PostScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const { isAuthenticated, user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const decodedUri = uri ? decodeURIComponent(uri) : "";

  // Queries and mutations
  const postThreadQuery = usePostThread(decodedUri);
  const createReplyMutation = useCreateReply();
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const repostMutation = useRepost();
  const deleteRepostMutation = useDeleteRepost();

  const thread = postThreadQuery.data?.thread;
  const post = thread?.post;
  const replies =
    thread?.replies
      ?.filter((reply: any) => reply.post)
      .map((reply: any) => reply.post) || [];

  const handleLike = async (
    postUri: string,
    cid: string,
    isLiked: boolean,
    likeUri?: string
  ) => {
    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "Please log in to like posts");
      return;
    }

    try {
      if (isLiked && likeUri) {
        await unlikePostMutation.mutateAsync({ likeUri });
      } else {
        await likePostMutation.mutateAsync({ uri: postUri, cid });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update like status");
    }
  };

  const handleRepost = async (
    postUri: string,
    cid: string,
    isReposted: boolean,
    repostUri?: string
  ) => {
    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "Please log in to repost");
      return;
    }

    try {
      if (isReposted && repostUri) {
        await deleteRepostMutation.mutateAsync({ repostUri });
      } else {
        await repostMutation.mutateAsync({ uri: postUri, cid });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update repost status");
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !post || !isAuthenticated) return;

    try {
      await createReplyMutation.mutateAsync({
        text: replyText,
        parentUri: post.uri,
        parentCid: post.cid,
        rootUri: post.uri,
        rootCid: post.cid,
      });

      setReplyText("");
      setShowReplyInput(false);
      Alert.alert("Success", "Reply posted successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to post reply");
    }
  };

  const handleShare = async () => {
    if (!post) return;

    try {
      const shareUrl = `https://bsky.app/profile/${
        post.author.handle
      }/post/${post.uri.split("/").pop()}`;

      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({
            title: `Post by @${post.author.handle}`,
            text: post.record.text,
            url: shareUrl,
          });
        } else {
          await navigator.clipboard.writeText(shareUrl);
          Alert.alert("Copied", "Post URL copied to clipboard");
        }
      } else {
        Alert.alert("Share", `Share this post: ${shareUrl}`);
      }
    } catch (error) {
      console.error("Failed to share post:", error);
      Alert.alert("Error", "Failed to share post");
    }
  };

  if (postThreadQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Post" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </View>
    );
  }

  if (postThreadQuery.error || !post) {
    return (
      <View style={styles.container}>
        <Header title="Post" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {postThreadQuery.error?.message || "Post not found"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Post" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Post */}
        <View style={styles.mainPost}>
          <Post
            post={post}
            onLike={(uri, cid) =>
              handleLike(uri, cid, !!post.viewer?.like, post.viewer?.like)
            }
            onRepost={(uri, cid) =>
              handleRepost(uri, cid, !!post.viewer?.repost, post.viewer?.repost)
            }
            onComment={() => setShowReplyInput(true)}
            isDetailView={true}
          />
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowReplyInput(true)}
          >
            <MessageCircle size={20} color="#6b7280" />
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              handleRepost(
                post.uri,
                post.cid,
                !!post.viewer?.repost,
                post.viewer?.repost
              )
            }
          >
            <Repeat2 size={20} color="#6b7280" />
            <Text style={styles.actionText}>Repost</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              handleLike(
                post.uri,
                post.cid,
                !!post.viewer?.like,
                post.viewer?.like
              )
            }
          >
            <Heart size={20} color="#6b7280" />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share size={20} color="#6b7280" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Reply Input */}
        {showReplyInput && isAuthenticated && user && (
          <View style={styles.replySection}>
            <View style={styles.replyHeader}>
              <Text style={styles.replyTitle}>
                Reply to @{post.author.handle}
              </Text>
              <TouchableOpacity
                onPress={() => setShowReplyInput(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.replyInput}>
              <Avatar
                uri={user.avatar}
                size="medium"
                fallbackText={user.displayName || user.handle}
              />
              <View style={styles.replyTextContainer}>
                <TextInput
                  style={styles.replyTextInput}
                  placeholder="Write your reply..."
                  placeholderTextColor="#9ca3af"
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                  maxLength={300}
                  autoFocus
                />
                <View style={styles.replyActions}>
                  <Text style={styles.characterCount}>
                    {replyText.length}/300
                  </Text>
                  <Button
                    title={
                      createReplyMutation.isPending ? "Replying..." : "Reply"
                    }
                    onPress={handleReply}
                    disabled={
                      !replyText.trim() || createReplyMutation.isPending
                    }
                    size="small"
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Authentication prompt for non-authenticated users */}
        {showReplyInput && !isAuthenticated && (
          <View style={styles.authPrompt}>
            <Text style={styles.authPromptText}>
              Please log in to reply to posts
            </Text>
            <Button
              title="Log In"
              onPress={() => {
                setShowReplyInput(false);
                router.push("/login");
              }}
              size="medium"
            />
          </View>
        )}

        {/* Replies */}
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </Text>

          {replies.map((reply: any) => (
            <View key={reply.uri} style={styles.replyItem}>
              <Post
                post={reply}
                onLike={(uri, cid) =>
                  handleLike(uri, cid, !!reply.viewer?.like, reply.viewer?.like)
                }
                onRepost={(uri, cid) =>
                  handleRepost(
                    uri,
                    cid,
                    !!reply.viewer?.repost,
                    reply.viewer?.repost
                  )
                }
                onComment={() => {}}
                isReply={true}
              />
            </View>
          ))}

          {replies.length === 0 && (
            <View style={styles.noReplies}>
              <Text style={styles.noRepliesText}>No replies yet</Text>
              <Text style={styles.noRepliesSubtext}>
                Be the first to reply!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
  },
  mainPost: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  replySection: {
    backgroundColor: "#f9fafb",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  replyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 14,
    color: "#6b7280",
  },
  replyInput: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  replyTextContainer: {
    flex: 1,
  },
  replyTextInput: {
    fontSize: 16,
    lineHeight: 22,
    color: "#111827",
    minHeight: 80,
    textAlignVertical: "top",
  },
  replyActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  characterCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  authPrompt: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  authPromptText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: "center",
  },
  repliesSection: {
    paddingTop: 16,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  replyItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  noReplies: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  noRepliesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  noRepliesSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
});
