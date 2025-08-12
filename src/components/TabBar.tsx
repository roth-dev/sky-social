import useAnimatedBottomTab from "@/hooks/useAnimatedBottomTab";
import { HStack } from "./ui";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated from "react-native-reanimated";
import { Pressable, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { isIOS } from "@/platform";

export default function TabBar(props: BottomTabBarProps) {
  const { colorScheme } = useSettings();
  const { animatedStyle, backgroundColor } = useAnimatedBottomTab();

  return (
    <Animated.View
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
              props.navigation.navigate(route.name);
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
