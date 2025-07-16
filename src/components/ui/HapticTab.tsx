import React, { useCallback, ReactNode, forwardRef } from "react";
import { TouchableOpacity, View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Formater } from "@/lib/format";
import { Text } from "./Text";

const hapticTabVariants = cva(
  "flex-row items-center justify-center rounded-lg transition-colors",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
        outline:
          "bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
        secondary:
          "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300",
        destructive:
          "bg-red-500 hover:bg-red-600 active:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 dark:active:bg-red-800",
        share: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
      },
      size: {
        sm: "px-2 py-1",
        md: "px-3 py-2",
        lg: "px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface HapticTabProps
  extends React.ComponentPropsWithoutRef<typeof TouchableOpacity>,
    VariantProps<typeof hapticTabVariants> {
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  leftIconSize?: number;
  rightIconSize?: number;
  leftIconColor?: string;
  rightIconColor?: string;
  leftIconFill?: string;
  rightIconFill?: string;
  leftIconStrokeWidth?: number;
  rightIconStrokeWidth?: number;
  children?: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  hapticType?: "light" | "medium" | "heavy" | "success" | "warning" | "error";
  icon?: LucideIcon;
  iconSize?: number;
  iconColor?: string;
  count?: number;
  isActive?: boolean;
}

export const HapticTab = forwardRef<
  React.ComponentRef<typeof TouchableOpacity>,
  HapticTabProps
>(
  (
    {
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      leftIconSize,
      rightIconSize,
      leftIconColor = "#6b7280",
      rightIconColor = "#6b7280",
      leftIconFill = "none",
      rightIconFill = "none",
      leftIconStrokeWidth,
      rightIconStrokeWidth,
      children,
      onPress,
      disabled = false,
      className,
      variant,
      size,
      hapticType = "light",
      icon: Icon,
      iconSize,
      iconColor,
      count,
      isActive,
      ...props
    },
    ref
  ) => {
    const handlePress = useCallback(() => {
      // Trigger haptic feedback
      if (!disabled) {
        switch (hapticType) {
          case "light":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case "medium":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case "heavy":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case "success":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case "warning":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case "error":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          default:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      onPress();
    }, [onPress, disabled, hapticType]);

    const getIconSize = () => {
      switch (size) {
        case "sm":
          return 16;
        case "md":
          return 20;
        case "lg":
          return 24;
        default:
          return 20;
      }
    };

    const finalLeftIconSize = leftIconSize || getIconSize();
    const finalRightIconSize = rightIconSize || getIconSize();
    const finalIconSize = iconSize || getIconSize();

    // Handle new simplified icon props
    const finalIconColor = iconColor || (isActive ? "#ef4444" : "#6b7280");
    const finalIconFill = isActive ? "#ef4444" : "none";

    // Special handling for repost icon (green when active)
    const isRepostIcon =
      Icon?.displayName === "Repeat2" || Icon?.name === "Repeat2";
    const repostIconColor =
      isRepostIcon && isActive ? "#10b981" : finalIconColor;
    const repostIconFill = isRepostIcon && isActive ? "#10b981" : finalIconFill;

    return (
      <Pressable
        ref={ref}
        className={cn(
          hapticTabVariants({ variant, size }),
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onPress={handlePress}
        disabled={disabled}
        {...props}
      >
        {Icon && (
          <Icon
            size={finalIconSize}
            color={isRepostIcon ? repostIconColor : finalIconColor}
            fill={isRepostIcon ? repostIconFill : finalIconFill}
          />
        )}
        {LeftIcon && (
          <LeftIcon
            size={finalLeftIconSize}
            color={leftIconColor}
            fill={leftIconFill}
            strokeWidth={leftIconStrokeWidth}
          />
        )}

        {(children || count !== undefined) && (
          <View
            className={cn((Icon || LeftIcon) && "ml-1", RightIcon && "mr-1")}
          >
            {count !== undefined && count > 0 && (
              <Text
                size="sm"
                font="semiBold"
                className={cn(
                  "ml-1",
                  isActive
                    ? isRepostIcon
                      ? "text-green-500 dark:text-green-500"
                      : "text-red-500 dark:text-red-500"
                    : "text-gray-500 dark:text-gray-500"
                )}
              >
                {Formater.formatNumberToKOrM(count)}
              </Text>
            )}
            {children}
          </View>
        )}

        {RightIcon && (
          <RightIcon
            size={finalRightIconSize}
            color={rightIconColor}
            fill={rightIconFill}
            strokeWidth={rightIconStrokeWidth}
          />
        )}
      </Pressable>
    );
  }
);

HapticTab.displayName = "HapticTab";
