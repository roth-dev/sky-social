import React, { memo, useMemo } from "react";
import { StyleSheet } from "react-native";
import { View } from "../ui";
import { Post } from "../Post";
import { ATThreadViewPost } from "@/types/atproto";

type UnknownObj = Record<string, unknown>;
function isThreadViewPostNode(value: unknown): value is ATThreadViewPost {
  return (
    !!value && typeof value === "object" && "post" in (value as UnknownObj)
  );
}

interface ThreadPostProps {
  node: ATThreadViewPost;
  depth?: number;
}

const ThreadPost = memo(function Comp({ node, depth = 0 }: ThreadPostProps) {
  const replies = useMemo(() => {
    const rawReplies = (node as unknown as UnknownObj).replies as unknown;
    if (Array.isArray(rawReplies)) {
      return rawReplies.filter(isThreadViewPostNode) as ATThreadViewPost[];
    }
    return [] as ATThreadViewPost[];
  }, [node]);

  return (
    <View style={styles.threadContainer}>
      {/* Thread connector line - positioned at avatar center */}
      {depth > 0 && (
        <View
          style={[
            styles.threadLine,
            {
              left: depth === 0 ? 32 : 24, // 24px for medium avatar center (48px/2)
              top: 60, // Start below the avatar
            },
          ]}
        />
      )}

      {/* Post content */}
      <View style={styles.postWrapper}>
        <Post post={node.post} isDetailView={depth === 0} isReply={depth > 0} />
      </View>

      {/* Render replies */}
      {replies.map((child, idx) => (
        <ThreadPost
          key={`${child.post.uri}-${idx}`}
          node={child}
          depth={depth + 1}
        />
      ))}
    </View>
  );
});

ThreadPost.displayName = "ThreadPost";

const styles = StyleSheet.create({
  threadContainer: {
    position: "relative",
  },
  threadLine: {
    position: "absolute",
    width: 2,
    backgroundColor: "#4a5568", // Darker gray to match BlueSky
    zIndex: 1,
    bottom: 0, // Extend to bottom to connect with next post
  },
  postWrapper: {
    position: "relative",
    zIndex: 2,
    backgroundColor: "#000", // Ensure post content appears above line
  },
});

export default ThreadPost;
