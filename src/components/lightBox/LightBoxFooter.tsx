import { Pressable, StyleProp, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../ui";
import { useState } from "react";

interface Props {
  alt: string;
  style?: StyleProp<ViewStyle>;
}
export default function LightBoxFooter({ alt, style }: Props) {
  const [numberOfLines, setNumberOfLines] = useState(3);
  if (!alt) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          zIndex: 10,
          bottom: 0,
          left: 0,
          right: 0,
        },
        style,
      ]}
    >
      <SafeAreaView
        edges={["bottom"]}
        style={{
          padding: 10,
        }}
      >
        <Pressable
          onPress={() => setNumberOfLines((prev) => (prev === 3 ? 100 : 3))}
        >
          <Text className="text-white" numberOfLines={numberOfLines}>
            {alt}
          </Text>
        </Pressable>
      </SafeAreaView>
    </Animated.View>
  );
}
