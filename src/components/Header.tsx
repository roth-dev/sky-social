import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "@/contexts/SettingsContext";
import { BlurView } from "expo-blur";
import useScrollDirection from "@/hooks/useScrollDirection";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { isAndroid } from "@/platform";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
interface HeaderProps {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  collapsible?: boolean;
  disabledLeft?: boolean;
  setHeadeHeight?: Dispatch<SetStateAction<number>>;
}
function CollapsibleHeader({
  children,
  setHeadeHeight,
}: PropsWithChildren<Pick<HeaderProps, "setHeadeHeight">>) {
  const headerHeight = useSharedValue(120);

  const direction = useScrollDirection();

  const { colorScheme } = useSettings();

  const translateY = useDerivedValue(() => {
    return withTiming(direction.value === "down" ? -headerHeight.value : 0, {
      duration: 150,
    });
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View
      onLayout={(e) => {
        const { height } = e.nativeEvent.layout;
        headerHeight.value = height;
        setHeadeHeight?.(height);
      }}
      style={[
        {
          position: "absolute",
          width: "100%",
          zIndex: 100,
          borderBottomColor: Colors.border[colorScheme],
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
        animatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}
export function Header({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  collapsible,
  disabledLeft,
  setHeadeHeight,
}: HeaderProps) {
  const { colorScheme } = useSettings();

  const insets = useSafeAreaInsets();

  const handleLeftIconPress = useCallback(() => {
    if (onLeftPress) {
      onLeftPress();
    } else {
      if (router.canGoBack()) {
        router.back();
      }
    }
  }, []);

  let header = (
    <BlurView
      intensity={!collapsible ? undefined : 100}
      tint={collapsible ? colorScheme : undefined}
      style={{
        backgroundColor:
          isAndroid || !collapsible
            ? Colors.background.primary[colorScheme]
            : undefined,
        paddingTop: insets.top,
        justifyContent: "flex-end",
      }}
    >
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          className="w-10 h-10 items-center justify-center"
          onPress={handleLeftIconPress}
          disabled={disabledLeft}
        >
          {leftIcon ? (
            leftIcon
          ) : disabledLeft ? (
            <></>
          ) : (
            <ArrowLeft size={24} color={Colors.inverted[colorScheme]} />
          )}
        </Pressable>
        <Text className="text-lg font-semibold flex-1 text-center dark:text-white text-gray-900">
          {title}
        </Text>

        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={onRightPress}
          disabled={!rightIcon}
        >
          {rightIcon}
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  if (collapsible) {
    return (
      <CollapsibleHeader setHeadeHeight={setHeadeHeight}>
        {header}
      </CollapsibleHeader>
    );
  }

  return header;
}
