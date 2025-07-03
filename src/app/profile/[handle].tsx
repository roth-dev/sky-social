import UserProfile from "@/components/profile/UserProfile";
import { Text } from "@/components/ui";
import { useLocalSearchParams } from "expo-router";

export default function UserProfileScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();

  if (!handle) return <Text>User handle not found</Text>;

  return <UserProfile handle={handle} />;
}
