import React from "react";
import { TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import {
  SearchFilters as SearchFiltersType,
  SearchResultType,
} from "@/types/search";
import { Users, MessageSquare, Rss } from "lucide-react-native";
import { Text, View } from "../ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  resultCounts?: {
    users: number;
    posts: number;
    feeds: number;
  };
}

const FILTER_OPTIONS = [
  { key: "users" as SearchResultType, label: "People", icon: Users },
  { key: "posts" as SearchResultType, label: "Posts", icon: MessageSquare },
  { key: "feeds" as SearchResultType, label: "Feeds", icon: Rss },
];

export function SearchFilters({
  filters,
  onFiltersChange,
  resultCounts,
}: SearchFiltersProps) {
  const { colorScheme } = useSettings();
  const handleTypeChange = (type: SearchResultType) => {
    onFiltersChange({ ...filters, type });
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: Colors.border[colorScheme],
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4 pt-2 pb-4"
      >
        {FILTER_OPTIONS.map((option) => {
          const isActive = filters.type === option.key;
          const count = resultCounts?.[option.key];
          const IconComponent = option.icon;

          return (
            <TouchableOpacity
              className={cn(
                "flex-row items-center px-4 gap-2 border border-[#e5e7eb] py-2 rounded-full",
                isActive ? `border-[#3b82f6]` : `dark:border-[#374151]`
              )}
              key={option.key}
              onPress={() => handleTypeChange(option.key)}
            >
              <IconComponent
                size={18}
                color={isActive ? Colors.primary : "#6b7280"}
              />
              <Text
                style={[styles.filterText, isActive && styles.activeFilterText]}
              >
                {option.label}
              </Text>
              {count !== undefined && count > 0 && (
                <View
                  className={cn(
                    "min-w-7 h-7 px-1  items-center justify-center rounded-full",
                    isActive ? "bg-blue-500" : "bg-gray-300"
                  )}
                >
                  <Text
                    size="sm"
                    className={cn(isActive ? "text-white" : "text-black")}
                  >
                    {count > 99 ? "99+" : count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activeFilterButton: {
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeFilterText: {
    color: Colors.primary,
  },
  activeCountBadge: {
    backgroundColor: Colors.primary,
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
  },
  activeCountText: {
    color: "#ffffff",
  },
});
