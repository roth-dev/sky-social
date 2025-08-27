import React, { FunctionComponent } from "react";
import { HStack, Text, Button } from "@/components/ui";
import { Image as ImageIcon, Video, Camera } from "lucide-react-native";
import { Colors } from "@/constants/colors";

interface ComposerToolbarProps {
  text: string;
  maxLength: number;
  images: { uri: string }[];
  video: string | null;
  isPosting: boolean;
  canPost: boolean;
  onPost: () => void;
  onPickMedia: (fromCamera: boolean, type: "image" | "video") => void;
}

export const ComposerToolbar: FunctionComponent<ComposerToolbarProps> = ({
  text,
  maxLength,
  images,
  video,
  onPickMedia,
}) => (
  <HStack className="px-2 py-2 bg-white border-t border-gray-300 dark:border-gray-700">
    {/* Image Gallery Button */}
    <Button
      variant="ghost"
      size="icon"
      className="p-2 mr-2"
      disabled={
        (images.length >= 4 && !video) || (!!video && images.length > 0)
      }
      onPress={() => onPickMedia(false, "image")}
      leftIcon={ImageIcon}
      leftIconSize={20}
      leftIconColor={
        (images.length >= 4 && !video) || (!!video && images.length > 0)
          ? "#d1d5db"
          : Colors.primary
      }
    />

    {/* Video Gallery Button */}
    <Button
      variant="ghost"
      size="icon"
      className="p-2 mr-2"
      disabled={images.length > 0 || !!video}
      onPress={() => onPickMedia(false, "video")}
      leftIcon={Video}
      leftIconSize={20}
      leftIconColor={images.length > 0 || !!video ? "#d1d5db" : Colors.primary}
    />

    {/* Camera Button */}
    <Button
      variant="ghost"
      size="icon"
      className="p-2"
      disabled={
        (images.length >= 4 && !video) || (!!video && images.length > 0)
      }
      onPress={() => onPickMedia(true, "image")}
      leftIcon={Camera}
      leftIconSize={20}
      leftIconColor={
        (images.length >= 4 && !video) || (!!video && images.length > 0)
          ? "#d1d5db"
          : Colors.primary
      }
    />

    <Text size="base" font="semiBold" className="text-gray-500 ml-auto">
      {text.length}/{maxLength}
    </Text>
  </HStack>
);
