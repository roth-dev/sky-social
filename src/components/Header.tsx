import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export function Header({ title, leftIcon, rightIcon, onLeftPress, onRightPress }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="bg-white border-b border-gray-200"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={onLeftPress}
          disabled={!leftIcon}
        >
          {leftIcon}
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-gray-900 flex-1 text-center">{title}</Text>

        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={onRightPress}
          disabled={!rightIcon}
        >
          {rightIcon}
        </TouchableOpacity>
      </View>
    </View>
  );
}