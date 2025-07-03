import React from "react";
import { Post } from "@/components/Post";
import { ATPost } from "@/types/atproto";
import { View } from "../ui";

interface PostSearchResultProps {
  post: ATPost;
  onLike?: (uri: string, cid: string) => void;
  onRepost?: (uri: string, cid: string) => void;
  onComment?: (uri: string) => void;
}

export function PostSearchResult({
  post,
  onLike,
  onRepost,
  onComment,
}: PostSearchResultProps) {
  return (
    <View>
      <Post
        post={post}
        onLike={onLike}
        onRepost={onRepost}
        onComment={onComment}
      />
    </View>
  );
}
