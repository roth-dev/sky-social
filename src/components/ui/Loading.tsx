import { memo } from "react";
import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
const Loading = memo(function Comp({
  size = "small",
  style,
}: {
  size: "small" | "large";
  style?: StyleProp<ViewStyle>;
}) {
  return <ActivityIndicator size={size} style={style} />;
});

export default Loading;
