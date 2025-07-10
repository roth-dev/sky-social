import { PropsWithChildren, useMemo } from "react";
import { View } from "../ui";
import { Dimensions, StyleSheet } from "react-native";
import { VideoPlayerProps } from "./type";
import Loading from "../ui/Loading";

type Props = PropsWithChildren<
  Pick<VideoPlayerProps, "containerStyle" | "aspectRatio" | "isDetailView">
> & {
  loading?: boolean;
};

const { width: screenWidth } = Dimensions.get("window");

export default function VideoContainer({
  children,
  isDetailView,
  containerStyle,
  aspectRatio,
  loading,
}: Props) {
  // Calculate video dimensions
  const dimensions = useMemo(() => {
    const maxWidth = screenWidth - 32;
    const defaultAspectRatio = 16 / 9;
    const videoAspectRatio = aspectRatio
      ? aspectRatio.width / aspectRatio.height
      : defaultAspectRatio;

    let width = maxWidth;
    let height = width / videoAspectRatio;

    // Limit height for better UX
    const maxHeight = isDetailView ? 500 : 400;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * videoAspectRatio;
    }

    return { width, height };
  }, [aspectRatio, isDetailView]);

  return (
    <View
      style={[styles.container, { height: dimensions.height }, containerStyle]}
    >
      {children}
      {loading && (
        <View className="w-full h-full absolute items-center justify-center">
          <Loading size="lg" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 12,
    position: "relative",
  },
});
