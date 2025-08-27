import React, { PropsWithChildren, ReactElement, useCallback } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Pressable,
  View,
  LayoutChangeEvent,
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
import { isAndroid, isNative } from "@/platform";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { Text } from "./ui";
import { cn } from "@/lib/utils";
interface HeaderProps {
  title: string;
  isHome?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  collapsible?: boolean;
  disableSafeArea?: boolean;
  disabledLeft?: boolean;
  disableTopHeader?: boolean;
  onHeightChange?: (height: number) => void;
  renderHeader?: () => React.ReactNode;
  renderRight?: () => ReactElement;
  renderLeft?: () => ReactElement;
}
function CollapsibleHeader({
  children,
  onHeightChange,
}: PropsWithChildren<Pick<HeaderProps, "onHeightChange">>) {
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

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { height } = e.nativeEvent.layout;
      headerHeight.set(height);
      onHeightChange?.(height);
    },
    [onHeightChange, headerHeight]
  );

  return (
    <Animated.View
      onLayout={onLayout}
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
  isHome,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  collapsible,
  disabledLeft,
  onHeightChange,
  renderHeader,
  disableTopHeader,
  disableSafeArea,
  renderLeft,
  renderRight,
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
  }, [onLeftPress]);

  let header = (
    <BlurView
      intensity={!collapsible ? undefined : 80}
      tint={collapsible ? colorScheme : undefined}
      style={{
        backgroundColor:
          isAndroid || !collapsible
            ? Colors.background.primary[colorScheme]
            : undefined,
        paddingTop: !disableSafeArea ? insets.top : undefined,
      }}
      className={cn(isNative && isHome && "pb-3")}
    >
      {!disableTopHeader && (
        <View className="flex-row items-center justify-between px-4 py-3 web:dark:bg-[#111827]">
          {renderLeft ? (
            renderLeft()
          ) : (
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
          )}

          <Text font="bold" size="lg" className="flex-1 text-center">
            {title}
          </Text>

          {renderRight ? (
            renderRight()
          ) : (
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={onRightPress}
              disabled={!rightIcon}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      )}

      {
        // consider as footer of main header
      }
      {renderHeader?.()}
    </BlurView>
  );

  if (collapsible) {
    return (
      <CollapsibleHeader onHeightChange={onHeightChange}>
        {header}
      </CollapsibleHeader>
    );
  }

  return header;
}
