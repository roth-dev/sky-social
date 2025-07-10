import { EmbedImage } from "@/types/embed";
import PagerView from "../pager";
import { Image } from "expo-image";

interface Props {
  initailIndex?: number;
  images: EmbedImage[];
}
export default function LightBoxImage({ images, initailIndex }: Props) {
  return (
    <PagerView initialPage={initailIndex} style={{ flex: 1 }}>
      {images.map((image, index) => {
        return (
          <Image
            key={index}
            source={{ uri: image.uri }}
            alt={image.alt}
            contentFit="contain"
            style={{ width: "100%", height: "100%" }}
          />
        );
      })}
    </PagerView>
  );
}
