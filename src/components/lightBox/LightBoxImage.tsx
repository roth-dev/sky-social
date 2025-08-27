import { EmbedImage } from "@/types/embed";
import PagerView from "../pager";
import { Pressable } from "react-native";
import { Image } from "@/components/ui";

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
            <Image
              source={{ uri: image.fullsize }}
              alt={image.alt}
              accessibilityLabel={image.alt}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </Pressable>
        );
      })}
    </PagerView>
  );
}
