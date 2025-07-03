import React from "react";
import { TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import {
  SearchFilters as SearchFiltersType,
  SearchResultType,
} from "@/types/search";
import { Users, MessageSquare, Rss } from "lucide-react-native";
import { Text, View } from "../ui";

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
  const handleTypeChange = (type: SearchResultType) => {
    onFiltersChange({ ...filters, type });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {FILTER_OPTIONS.map((option) => {
          const isActive = filters.type === option.key;
          const count = resultCounts?.[option.key];
          const IconComponent = option.icon;

          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                isActive && styles.activeFilterButton,
              ]}
              onPress={() => handleTypeChange(option.key)}
            >
              <IconComponent
                size={18}
                color={isActive ? "#3b82f6" : "#6b7280"}
              />
              <Text
                style={[styles.filterText, isActive && styles.activeFilterText]}
              >
                {option.label}
              </Text>
              {count !== undefined && count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    isActive && styles.activeCountBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isActive && styles.activeCountText,
                    ]}
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
    borderBottomColor: "#e5e7eb",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeFilterText: {
    color: "#3b82f6",
  },
  countBadge: {
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  activeCountBadge: {
    backgroundColor: "#3b82f6",
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeCountText: {
    color: "#ffffff",
  },
});
