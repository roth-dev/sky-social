import useAnimatedBottomTab from "@/hooks/useAnimatedBottomTab";
import { HStack } from "./ui";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, { FadeIn } from "react-native-reanimated";
import { Pressable, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { isIOS } from "@/platform";
import { useTabBarStore } from "@/store/tabBarStore";

export default function TabBar(props: BottomTabBarProps) {
  const { colorScheme } = useSettings();
  const { animatedStyle, backgroundColor } = useAnimatedBottomTab();
  const { isVisible } = useTabBarStore();

  // If tab bar is not visible, return null (don't render it)
  if (!isVisible) return null;

  // Map tab route names to their nested stack's initial screen
  const nestedScreenMap: Record<string, string> = {
    "(index)": "index",
    "(search)": "search",
    "(create)": "create",
    "(video)": "video",
    "(account)": "account",
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        {
          position: "absolute",
          zIndex: 100,
          right: 0,
          left: 0,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Colors.border[colorScheme],
          backgroundColor: backgroundColor,
          paddingBottom: isIOS ? 25 : 0,
        },
        animatedStyle,
      ]}
    >
      <HStack
        style={{
          height: 56,
          backgroundColor,
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {props.state.routes.map((route, index) => {
          const isFocused = props.state.index === index;
          const { options } = props.descriptors[route.key];
          const icon = options.tabBarIcon;
          const onPress = () => {
            const event = props.navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              const nested = nestedScreenMap[route.name];
              if (nested) {
                // Navigate to the tab and specify the nested screen explicitly
                // to avoid falling back to the group's default "index" screen
                // when using grouped layouts in expo-router.
                props.navigation.navigate(route.name, { screen: nested });
              } else {
                props.navigation.navigate(route.name);
              }
            }
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              {icon
                ? icon({
                    focused: isFocused,
                    color: isFocused
                      ? Colors.primary
                      : options.tabBarInactiveTintColor || "#6b7280",
                    size: 24,
                  })
                : null}
            </Pressable>
          );
        })}
      </HStack>
    </Animated.View>
  );
}
