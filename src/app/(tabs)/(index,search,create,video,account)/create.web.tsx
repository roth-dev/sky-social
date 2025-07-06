import { Redirect, Slot } from "expo-router";

export default function CreatePostScreen() {
  // return unstyle stack
  return <Redirect href="/(modal)/composer" />;
}
