import { Colors } from "@/constants/colors";
import { Text, View } from "../ui";
import { Button } from "../ui/Button";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

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
          <Trans>Unable to load video</Trans>
        </Text>
        <Button
          title={t`Retry`}
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
