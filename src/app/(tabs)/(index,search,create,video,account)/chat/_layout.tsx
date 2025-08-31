import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: "#000",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Messages",
        }}
      />
      <Stack.Screen
        name="[conversationId]"
        options={{
          title: "Chat",
          presentation: "card",
        }}
      />
    </Stack>
  );
}
