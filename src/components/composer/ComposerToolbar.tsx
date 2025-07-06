import React, { FunctionComponent } from "react";
import { TouchableOpacity } from "react-native";
import { HStack, Text } from "@/components/ui";
import { MenuView } from "@react-native-menu/menu";
import { Image as ImageIcon } from "lucide-react-native";
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
  <HStack className="px-2 py-2 bg-white border-t items-center justify-between">
    <MenuView
      title="Add Media"
      onPressAction={({ nativeEvent }) => {
        if (nativeEvent.event === "pick_image_gallery")
          onPickMedia(false, "image");
        if (nativeEvent.event === "pick_image_camera")
          onPickMedia(true, "image");
        if (nativeEvent.event === "pick_video_gallery")
          onPickMedia(false, "video");
        if (nativeEvent.event === "pick_video_camera")
          onPickMedia(true, "video");
      }}
      actions={[
        {
          id: "pick_image_gallery",
          title: "Choose from Gallery",
          image: "photo",
        },
        { id: "pick_image_camera", title: "Take Photo", image: "camera" },
        {
          id: "pick_video_gallery",
          title: "Video from Gallery",
          image: "video",
        },
        { id: "pick_video_camera", title: "Record Video", image: "video" },
      ]}
      style={{ marginBottom: 0, alignSelf: "flex-start" }}
      shouldOpenOnLongPress={false}
    >
      <TouchableOpacity
        className="flex-row items-center p-2"
        disabled={
          (images.length >= 4 && !video) || (!!video && images.length > 0)
        }
      >
        <ImageIcon
          size={20}
          color={
            (images.length >= 4 && !video) || (!!video && images.length > 0)
              ? "#d1d5db"
              : Colors.primary
          }
        />
      </TouchableOpacity>
    </MenuView>
    <Text size="base" font="semiBold" className="text-gray-500 ml-auto">
      {text.length}/{maxLength}
    </Text>
  </HStack>
);
