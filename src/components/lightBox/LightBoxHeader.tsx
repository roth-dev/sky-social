import { ArrowLeft, MoreHorizontal } from "lucide-react-native";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { DropDownMenu } from "../dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

interface LightBoxHeaderProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}
export default function LightBoxHeader({
  style,
  onPress,
}: LightBoxHeaderProps) {
  return (
    <Animated.View style={[style]}>
      <SafeAreaView
        edges={["top"]}
        style={{
          position: "absolute",
          zIndex: 10,
          left: 0,
          right: 0,
          top: 10,
          marginHorizontal: 10,
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Pressable
          onPress={onPress}
          style={{
            width: 35,
            height: 35,
            borderRadius: 17.5,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft color="white" />
        </Pressable>
        <DropDownMenu
          actions={[
            {
              label: "Save Image",
              onPress: () => {
                console.log("Save Image");
              },
            },
            {
              label: "Share",
              onPress: () => {
                console.log("Share");
              },
            },
          ]}
        >
          <Pressable
            style={{
              width: 35,
              height: 35,
              borderRadius: 17.5,
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoreHorizontal color="white" />
          </Pressable>
        </DropDownMenu>
      </SafeAreaView>
    </Animated.View>
  );
}
