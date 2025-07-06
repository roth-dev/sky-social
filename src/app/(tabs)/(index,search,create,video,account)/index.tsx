import { Header } from "@/components/Header";
import { Home, Sparkles } from "lucide-react-native";
import { View } from "@/components/ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { Feed } from "@/components/Feed";
import { isMobileWeb, isNative } from "@/platform";
import { useState } from "react";

export default function HomeScreen() {
  const { isDarkMode } = useSettings();
  const [headerHeight, setHeadeHeight] = useState(120);

  return (
    <View className="flex-1 bg-white">
      <Header
        setHeadeHeight={setHeadeHeight}
        collapsible
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
      <Feed headerHeight={headerHeight} />
    </View>
  );
}
