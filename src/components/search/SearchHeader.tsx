import React from "react";
import { TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Search, X } from "lucide-react-native";
import { HStack, View } from "../ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";

interface SearchHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchHeader({
  query,
  onQueryChange,
  onClear,
  placeholder = "Search people, posts, and topics",
  autoFocus = false,
}: SearchHeaderProps) {
  const { colorScheme } = useSettings();
  return (
    <View className="p-3 pt-0">
      <HStack
        className="px-3 rounded-lg items-center"
        style={[{ backgroundColor: Colors.background.secondary[colorScheme] }]}
      >
        <Search size={20} color="#6b7280" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={onQueryChange}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          className="flex-1 text-md h-12 dark:text-white"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </HStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});
