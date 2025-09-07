import React from "react";
import { Switch } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface SettingsItemProps {
  title: string;
  description?: string;
  type: "toggle" | "button" | "info" | "navigation";
  icon: React.ReactNode;
  value?: boolean | string | number;
  onPress?: () => void;
  onToggle?: (value: boolean) => Promise<void> | void;
  destructive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  showSeparator?: boolean;
  className?: string;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  description,
  type,
  icon,
  value,
  onPress,
  onToggle,
  destructive = false,
  disabled = false,
  loading = false,
  showSeparator = true,
  className,
}) => {
  const renderRightElement = () => {
    switch (type) {
      case "toggle":
        return (
          <Switch
            value={value as boolean}
            onValueChange={onToggle}
            disabled={disabled || loading}
            thumbColor="#ffffff"
            trackColor={{
              false: "#767577",
              true: "#007AFF",
            }}
            style={{
              transform: [{ scale: 0.8 }],
            }}
          />
        );

      case "button":
        return (
          <Button
            variant={destructive ? "destructive" : "secondary"}
            size="small"
            title={destructive ? "Clear" : "Manage"}
            onPress={onPress}
            disabled={loading}
          />
        );

      case "navigation":
        return (
          <ChevronRight
            size={16}
            className="text-gray-400 dark:text-gray-500"
          />
        );

      default:
        return null;
    }
  };

  const itemContent = (
    <View
      className={cn(
        "flex-1 flex-row items-center justify-between px-3 py-4 bg-white dark:bg-gray-800",
        disabled && "opacity-50",
        className
      )}
    >
      <View darkColor="none" className="flex-row items-center flex-1">
        <View darkColor="none" className="mr-3">
          {icon}
        </View>
        <View darkColor="none" className="flex-1">
          <Text
            className={cn(
              "text-base font-normal text-black dark:text-white mb-1",
              destructive && "text-red-500 dark:text-red-400"
            )}
          >
            {title}
          </Text>
          {description && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5">
              {description}
            </Text>
          )}
        </View>
      </View>
      {renderRightElement()}
    </View>
  );

  if (type === "navigation") {
    return (
      <Button
        variant="ghost"
        className="justify-between p-0 bg-transparent"
        onPress={onPress}
        disabled={disabled || loading}
      >
        {itemContent}
        {showSeparator && <View className="h-px" />}
      </Button>
    );
  }

  return (
    <View>
      {itemContent}
      {showSeparator && <View className="h-px" />}
    </View>
  );
};

export interface SettingsSectionProps {
  title: string;
  items: SettingsItemProps[];
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  items,
  className,
}) => {
  return (
    <View className={cn("mb-6", className)} darkColor="none">
      <Text
        size="sm"
        font="semiBold"
        className="text-gray-500 dark:text-gray-400  tracking-wider mb-2"
      >
        {title}
      </Text>
      <View darkColor="none" className="bg-white rounded-xl overflow-hidden">
        {items.map((item, index) => (
          <SettingsItem
            key={index}
            {...item}
            showSeparator={index < items.length - 1}
          />
        ))}
      </View>
    </View>
  );
};
