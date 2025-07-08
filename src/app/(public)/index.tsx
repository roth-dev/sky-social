import { Text, View } from "@/components/ui";
import { useTimeline } from "@/hooks/query";

export default function PublicScree() {
  const timelines = useTimeline();
  return (
    <View className="flex-1">
      <Text>Public</Text>
    </View>
  );
}
