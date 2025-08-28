import React from "react";
import { Image as ExpoImage, ImageProps } from "expo-image";
import { isWeb } from "@/platform";

const ImageComponent: React.FC<ImageProps> = (props) => {
  const expoSource =
    typeof props.source === "object" && "uri" in props.source!
      ? props.source.uri
      : (props.source as { uri: string }).uri;

  // it important to know that the recyclingKey prop is used to optimize image rendering when using inside FlashList
  return (
    <ExpoImage recyclingKey={!isWeb ? expoSource : undefined} {...props} />
  );
};
export const Image = ImageComponent;

Image.displayName = "Image";

export default ImageComponent;
