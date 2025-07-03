import { Platform } from "react-native";
import { Header } from "@/components/Header";
import { Home, Sparkles } from "lucide-react-native";
import { View } from "@/components/ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { Feed } from "@/components/Feed";

export default function HomeScreen() {
  const { isDarkMode } = useSettings();

  return (
    <View className="flex-1 bg-white">
      {Platform.OS !== "web" && (
        <Header
          title="Sky Social"
          leftIcon={
            <Home
              size={24}
              color={
                isDarkMode
                  ? Colors.background.primary.light
                  : Colors.background.primary.dark
              }
            />
          }
          rightIcon={
            <Sparkles
              size={24}
              color={
                isDarkMode
                  ? Colors.background.primary.light
                  : Colors.background.primary.dark
              }
            />
          }
        />
      )}

      <Feed />
    </View>
  );
}
