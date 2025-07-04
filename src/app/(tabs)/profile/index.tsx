import { Text } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/profile/UserProfile";
import { router, Stack } from "expo-router";
import { Header } from "@/components/Header";
import { Settings } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colorScheme } = useSettings();
  if (!user) return <Text>User not found</Text>;
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <Header
              title={user.displayName ? `@${user.handle}` : ""}
              disabledLeft
              rightIcon={
                <Settings size={24} color={Colors.inverted[colorScheme]} />
              }
              onRightPress={() => router.push("/(tabs)/profile/settings")}
            />
          ),
        }}
      />
      <UserProfile handle={user.handle} />
    </>
  );
}
