import { Header } from "@/components/Header";
import UserProfile from "@/components/profile/UserProfile";
import { Text } from "@/components/ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Settings } from "lucide-react-native";

export default function UserProfileScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  if (!handle) return <Text>User handle not found</Text>;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <Header title={`@${handle}`} />,
        }}
      />
      <UserProfile handle={handle} />
    </>
  );
}
