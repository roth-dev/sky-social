import { Colors } from "@/constants/colors";
import { Text, View } from "../ui";
import { Button } from "../ui/Button";

interface Props {
  onRetry: () => void;
}
export default function VideoError({ onRetry }: Props) {
  return (
    <View
      style={[
        {
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
        },
      ]}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.background.secondary.light,
          gap: 16,
          height: "100%",
        }}
      >
        <Text style={{ fontSize: 16, color: "#6b7280", textAlign: "center" }}>
          Unable to load video
        </Text>
        <Button
          title="Retry"
          onPress={onRetry}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: Colors.primary,
            borderRadius: 8,
          }}
          textStyle={{ color: "#fff", fontSize: 14, fontWeight: "600" }}
        />
      </View>
    </View>
  );
}
