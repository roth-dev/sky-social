import React, { memo } from "react";
import { ScrollView } from "react-native";
import { ATThreadViewPost } from "@/types/atproto";
import ThreadPost from "./ThreadPost";

interface ThreadProps {
  thread: ATThreadViewPost | undefined;
}

const Thread = memo(function Comp({ thread }: ThreadProps) {
  if (!thread) return null;
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <ThreadPost node={thread} depth={0} />
    </ScrollView>
  );
});

Thread.displayName = "Thread";

export default Thread;
