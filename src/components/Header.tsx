import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/contexts/SettingsContext';

interface HeaderProps {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export function Header({ title, leftIcon, rightIcon, onLeftPress, onRightPress }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useSettings();

  return (
    <View 
      className={`border-b ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
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

        <Text className={`text-lg font-semibold flex-1 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
    </View>
  );
}