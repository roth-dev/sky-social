import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  className?: string;
}

export function Input({ 
  label, 
  error, 
  containerStyle, 
  style, 
  className,
  ...props 
}: InputProps) {
  return (
    <View className={`mb-4 ${className || ''}`} style={containerStyle}>
      {label && <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>}
      <TextInput
        className={`
          border border-gray-300 rounded-lg px-3 py-2 text-base bg-white
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        placeholderTextColor="#9ca3af"
        style={style}
        {...props}
      />
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}