import { useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Transition from "react-native-screen-transitions";
import { useTabBarStore } from "@/store/tabBarStore";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useLightBoxOpen } from "@/store/lightBox";
import LightBoxImage from "@/components/lightBox/LightBoxImage";
import LightBoxHeader from "@/components/lightBox/LightBoxHeader";
import LightBoxFooter from "@/components/lightBox/LightBoxFooter";

export default function PostImageView() {
  const { images, index, shareId, clearValue } = useLightBoxOpen();
  const [selectedIndex, setSelectedIndex] = useState(index ?? 0);

  const router = useRouter();

  const { hide, show } = useTabBarStore();
  const opacity = useSharedValue(1);

  useLayoutEffect(() => {
    // Hide tab bar when component mounts
    hide();
    // Show tab bar when component unmounts
    return () => {
      show();
      clearValue();
    };
  }, [hide, show, clearValue]);

  const onToggleHeader = () => {
    opacity.value = withTiming(opacity.value === 1 ? 0 : 1, {
      duration: 300,
    });
  };

  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const onGoBack = useCallback(() => {
    opacity.value = withTiming(0, { duration: 120 }, (finished) => {
      if (finished) {
        runOnJS(router.back)();
      }
    });
  }, [opacity, router]);

  const image = useMemo(() => {
    return images[selectedIndex];
  }, [images, selectedIndex]);

  return (
    <View style={{ flex: 1 }}>
      <LightBoxHeader onPress={onGoBack} style={animatedOpacity} />
      <Pressable
        className="flex-1 items-center justify-center"
        onPressIn={onToggleHeader}
      >
        <Transition.View
          style={{
            aspectRatio: 1,
            width: "100%",
          }}
          sharedBoundTag={shareId}
        >
          <LightBoxImage
            images={images}
            initialIndex={selectedIndex}
            onChangeIndex={(index) => {
              setSelectedIndex(index);
            }}
          />
        </Transition.View>
      </Pressable>
      {image && <LightBoxFooter alt={image.alt} style={animatedOpacity} />}
    </View>
  );
}
