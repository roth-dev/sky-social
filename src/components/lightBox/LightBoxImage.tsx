import { EmbedImage } from "@/types/embed";
import PagerView from "../pager";
import { Image } from "expo-image";

interface Props {
  initialIndex?: number;
  images: EmbedImage[];
  onChangeIndex?: (index: number) => void;
}
export default function LightBoxImage({
  images,
  initialIndex,
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
          <Image
            key={index}
            source={{ uri: image.fullsize }}
            alt={image.alt}
            accessibilityLabel={image.alt}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        );
      })}
    </PagerView>
  );
}
