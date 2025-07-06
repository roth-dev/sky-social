import React from "react";
import { TouchableOpacity, Text, ViewStyle, TextStyle } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
  shape?: "round" | "square";
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  style,
  textStyle,
  className,
  shape = "square",
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-500 active:bg-blue-600";
      case "secondary":
        return "bg-gray-500 active:bg-gray-600";
      case "outline":
        return "bg-transparent border border-gray-300 active:bg-gray-50";
      case "ghost":
        return "bg-transparent active:bg-gray-100";
      default:
        return "bg-blue-500 active:bg-blue-600";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "px-3 py-1.5";
      case "medium":
        return "px-4 py-2";
      case "large":
        return "px-6 py-3";
      default:
        return "px-4 py-2";
    }
  };

  const getTextVariantClasses = () => {
    switch (variant) {
      case "primary":
      case "secondary":
        return "text-white";
      case "outline":
      case "ghost":
        return "text-gray-700";
      default:
        return "text-white";
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case "small":
        return "text-sm";
      case "medium":
        return "text-base";
      case "large":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case "round":
        return "rounded-full";
      case "square":
      default:
        return "rounded-lg";
    }
  };

  return (
    <TouchableOpacity
      className={`
        ${getShapeClasses()}
        items-center justify-center flex-row
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled ? "opacity-50" : ""}
        ${className || ""}
      `}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={style}
    >
      <Text
        className={`
          font-semibold
          ${getTextVariantClasses()}
          ${getTextSizeClasses()}
          ${disabled ? "opacity-70" : ""}
        `}
        style={textStyle}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
