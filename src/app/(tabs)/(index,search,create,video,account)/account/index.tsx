import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/profile/UserProfile";
import { router, Stack } from "expo-router";
import { Header } from "@/components/Header";
import { Settings } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import LoginScreen from "@/app/login";

export default function Screen() {
  const { user } = useAuth();
  const { colorScheme } = useSettings();
  if (!user) return <LoginScreen />;
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <Header
              title={user.displayName ? `${user.handle}` : ""}
              disabledLeft
              rightIcon={
                <Settings size={24} color={Colors.inverted[colorScheme]} />
              }
              onRightPress={() => router.push("/(tabs)/setting")}
            />
          ),
        }}
      />
      <UserProfile handle={user.handle} />
    </>
  );
}
