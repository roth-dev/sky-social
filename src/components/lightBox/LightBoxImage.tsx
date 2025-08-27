import { EmbedImage } from "@/types/embed";
import PagerView from "../pager";
import { Image } from "expo-image";
import { Pressable } from "react-native";
import FastImage from "react-native-fast-image";

interface Props {
  initialIndex?: number;
  images: EmbedImage[];
  onPressIn?: () => void;
  onChangeIndex?: (index: number) => void;
}
export default function LightBoxImage({
  images,
  initialIndex,
  onPressIn,
  onChangeIndex,
}: Props) {
  return (
    <PagerView
      orientation="horizontal"
      initialPage={initialIndex}
      onPageSelected={(event) => {
        onChangeIndex?.(event.nativeEvent.position);
      }}
      style={{ flex: 1 }}
    >
      {images.map((image, index) => {
        return (
          <Pressable key={index} onPressIn={onPressIn}>
            <FastImage
              source={{ uri: image.fullsize }}
              // alt={image.alt}
              accessibilityLabel={image.alt}
              resizeMode="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </Pressable>
        );
      })}
    </PagerView>
  );
}
