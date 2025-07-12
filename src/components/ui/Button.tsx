import React, { ReactNode, forwardRef, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "flex-row items-center justify-center transition-colors",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
        secondary:
          "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700",
        outline:
          "bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
        destructive:
          "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
      },
      size: {
        small: "px-3 py-1.5",
        medium: "px-4 py-2",
        large: "px-6 py-3",
      },
      shape: {
        round: "rounded-full",
        square: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
      shape: "square",
    },
  }
);

const textVariants = cva("font-semibold", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-white",
      outline: "text-gray-700 dark:text-gray-300",
      ghost: "text-gray-700 dark:text-gray-300",
      destructive: "text-white",
    },
    size: {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "medium",
  },
});

interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof TouchableOpacity>,
    VariantProps<typeof buttonVariants> {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
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
}

export const Button = forwardRef<
  React.ComponentRef<typeof TouchableOpacity>,
  ButtonProps
>(
  (
    {
      title,
      onPress,
      disabled = false,
      style,
      textStyle,
      className,
      variant,
      size,
      shape,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      leftIconSize,
      rightIconSize,
      leftIconColor,
      rightIconColor,
      leftIconFill = "none",
      rightIconFill = "none",
      leftIconStrokeWidth,
      rightIconStrokeWidth,
      children,
      ...props
    },
    ref
  ) => {
    const getIconSize = useCallback(() => {
      switch (size) {
        case "small":
          return 16;
        case "medium":
          return 20;
        case "large":
          return 24;
        default:
          return 20;
      }
    }, [size]);

    const getIconColor = useCallback(() => {
      switch (variant) {
        case "primary":
        case "secondary":
        case "destructive":
          return "#ffffff";
        case "outline":
        case "ghost":
        default:
          return "#374151";
      }
    }, [variant]);

    const finalLeftIconSize = leftIconSize || getIconSize();
    const finalRightIconSize = rightIconSize || getIconSize();
    const finalLeftIconColor = leftIconColor || getIconColor();
    const finalRightIconColor = rightIconColor || getIconColor();

    return (
      <TouchableOpacity
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, shape }),
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={style}
        {...props}
      >
        {LeftIcon && (
          <LeftIcon
            size={finalLeftIconSize}
            color={finalLeftIconColor}
            fill={leftIconFill}
            strokeWidth={leftIconStrokeWidth}
          />
        )}

        {(title || children) && (
          <View className={cn(LeftIcon && "ml-2", RightIcon && "mr-2")}>
            {title && (
              <Text
                className={cn(
                  textVariants({ variant, size }),
                  disabled && "opacity-70"
                )}
                style={textStyle}
              >
                {title}
              </Text>
            )}
            {children}
          </View>
        )}

        {RightIcon && (
          <RightIcon
            size={finalRightIconSize}
            color={finalRightIconColor}
            fill={rightIconFill}
            strokeWidth={rightIconStrokeWidth}
          />
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";
