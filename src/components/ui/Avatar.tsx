import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { cn } from "../../lib/utils";
import { cva } from "class-variance-authority";
import { Image } from "./Image";
import { Text } from "./Text";

const avatarVariants = cva("rounded-full overflow-hidden", {
  variants: {
    size: {
      small: "w-10 h-10",
      medium: "w-12 h-12",
      large: "w-16 h-16",
      xl: "w-24 h-24",
    },
    border: {
      true: "border border-gray-300 dark:border-gray-700",
      false: "",
    },
  },
  defaultVariants: {
    size: "medium",
    border: false,
  },
});

const textVariants = cva("font-medium text-gray-500", {
  variants: {
    size: {
      small: "text-xs",
      medium: "text-sm",
      large: "text-xl",
      xl: "text-4xl",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

interface AvatarProps {
  uri?: string;
  size?: "small" | "medium" | "large" | "xl";
  fallbackText?: string;
  style?: StyleProp<ViewStyle>;
  /**
   * If true, applies a default border. If not provided or false, no border is shown.
   */
  border?: boolean;
  className?: string;
}

export function Avatar({
  uri,
  size = "medium",
  fallbackText,
  border = false,
  className,
  style,
}: AvatarProps) {
  // Determine border variant for cva
  const borderVariant = !!border;

  return (
    <View
      className={cn(avatarVariants({ size, border: borderVariant }), className)}
      style={style}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
      ) : (
        <View
          className={cn(
            "bg-gray-200 items-center justify-center w-full h-full"
          )}
        >
          <Text className={cn(textVariants({ size }))}>
            {fallbackText?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
      )}
    </View>
  );
}
