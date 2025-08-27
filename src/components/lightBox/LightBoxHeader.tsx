import { ArrowLeft, MoreHorizontal } from "lucide-react-native";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
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
    <Animated.View style={[style]} className="absolute left-0 right-0 z-10">
      <SafeAreaView
        edges={["top"]}
        className="top-2  mx-4 flex-row justify-between"
      >
        <Pressable onPress={onPress} style={styles.btn}>
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
          <Pressable style={styles.btn}>
            <MoreHorizontal color="white" />
          </Pressable>
        </DropDownMenu>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});
