import { Colors } from "@/constants/colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
  title: string;
  active: boolean;
  onPress?: () => void;
}
export default function TabBarItem({ onPress, title, active }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabItem, active && styles.activeTabItem]}
    >
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginRight: 8,
  },
  activeTabItem: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 2,
  },
  activeTabText: {
    color: Colors.primary,
  },
});
