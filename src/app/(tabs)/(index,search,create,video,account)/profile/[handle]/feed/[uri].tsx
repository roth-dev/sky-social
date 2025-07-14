import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Feed } from "@/components/Feed";
import { View } from "@/components/ui";
import { FeedDescriptor } from "@/lib/atproto";
import { Header } from "@/components/Header";

export default function UserFeedScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  // FeedDescriptor for a feedgen is: `feedgen|${FeedUri}`
  const decodedUri = decodeURIComponent(uri ?? "");
  const feedDescriptor = `feedgen|${decodedUri}` as FeedDescriptor;

  return (
    <View className="flex-1 bg-white">
      <Header title="Feed" />
      <Feed feed={feedDescriptor} />
    </View>
  );
}
