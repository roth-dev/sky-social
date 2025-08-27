import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { HStack, Text, Button } from "@/components/ui";
import { Image } from "expo-image";
import { Pen, X as CloseIcon } from "lucide-react-native";
import FastImage from "react-native-fast-image";

interface ComposerImagePreviewProps {
  images: { uri: string; alt?: string }[];
  onEditAlt: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

function getImageMaxSize(count: number) {
  if (count === 1) return 160;
  if (count === 2) return 140;
  return 110;
}

export const ComposerImagePreview: FunctionComponent<
  ComposerImagePreviewProps
> = ({ images, onEditAlt, onRemoveImage }) => {
  if (!images.length) return null;
  const maxSize = getImageMaxSize(images.length);
  return (
    <HStack className="px-4 mb-2 w-full">
      {images.map((img, idx) => (
        <View
          key={img.uri}
          className={`flex-1 relative ${
            idx !== images.length - 1 ? "mr-2" : ""
          }`}
          style={{ maxWidth: maxSize, maxHeight: maxSize, aspectRatio: 1 }}
        >
          <FastImage
            source={{ uri: img.uri }}
            className="w-full h-full"
            style={{ aspectRatio: 1, borderRadius: 10 }}
            resizeMode="cover"
          />
          {/* Edit and Remove overlays */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-8 bg-black/40 rounded-full p-1.5"
            onPress={() => onEditAlt(idx)}
            leftIcon={Pen}
            leftIconSize={16}
            leftIconColor="#fff"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 bg-black/40 rounded-full p-1.5"
            onPress={() => onRemoveImage(idx)}
            leftIcon={CloseIcon}
            leftIconSize={16}
            leftIconColor="#fff"
          />
          {/* ALT button */}
          <Button
            variant="ghost"
            className="absolute left-2 bottom-2 bg-black/60 rounded px-2 py-0.5"
            onPress={() => onEditAlt(idx)}
          >
            <Text className="text-white font-semibold text-xs">+ ALT</Text>
          </Button>
        </View>
      ))}
    </HStack>
  );
};
