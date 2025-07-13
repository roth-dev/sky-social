import { VideoContentFit } from "expo-video";
import { StyleProp, ViewStyle } from "react-native";

export interface VideoPlayerProps {
  uri: string;
  thumbnail?: string;
  aspectRatio?: { width: number; height: number };
  isDetailView?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  shouldPlay?: boolean;
  controls?: boolean;
  contentFit?: VideoContentFit;
  containerStyle?: StyleProp<ViewStyle>;
}
