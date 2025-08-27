import React, { useState, useRef, FunctionComponent } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { VStack } from "@/components/ui";
import { Image } from "expo-image";
import {
  Play,
  Pause,
  X as CloseIcon,
  Video as VideoIcon,
} from "lucide-react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import Svg, { Circle, G } from "react-native-svg";
import { BlurView } from "expo-blur";
import FastImage from "react-native-fast-image";

interface ComposerVideoPreviewProps {
  videoUri: string;
  thumbnailUri?: string;
  isCompressing?: boolean;
  compressionProgress?: number;
  onRemove: () => void;
  onCompressionComplete?: (compressedUri: string) => void;
}

const CircularProgress = ({ progress }: { progress: number }) => {
  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {/* Percentage text */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
};

export const ComposerVideoPreview: FunctionComponent<
  ComposerVideoPreviewProps
> = ({
  videoUri,
  thumbnailUri,
  isCompressing = false,
  compressionProgress = 0,
  onRemove,
  onCompressionComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<VideoView>(null);

  const player = useVideoPlayer(
    {
      uri: videoUri,
    },
    (player) => {
      player.loop = false;
    }
  );

  const handlePlayPause = async () => {
    if (isCompressing) return; // Disable play/pause during compression

    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const handleVideoLoad = () => {
    // Video loaded successfully
  };

  const handleVideoError = (error: any) => {
    console.error("Video error:", error);
  };

  return (
    <VStack className="px-4 mb-2">
      <View className="relative w-80 h-80 mx-auto bg-gray-100 rounded-xl overflow-hidden">
        {/* Video Player */}
        <VideoView
          ref={videoRef}
          style={{ width: "100%", height: "100%" }}
          player={player}
          contentFit="cover"
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          playsInline
        />

        {/* Thumbnail overlay when video is not playing */}
        {!isPlaying && thumbnailUri && (
          <View className="absolute inset-0">
            <FastImage
              source={{ uri: thumbnailUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/20" />
          </View>
        )}

        {/* Play/Pause Button */}
        <TouchableOpacity
          className="absolute inset-0 items-center justify-center"
          onPress={handlePlayPause}
          disabled={isCompressing}
        >
          <View className="bg-black/50 rounded-full p-3">
            {isPlaying ? (
              <Pause size={24} color="#fff" />
            ) : (
              <Play size={24} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        {/* Remove Button */}
        <TouchableOpacity
          className="absolute top-2 right-2 bg-black/40 rounded-full p-1.5"
          onPress={onRemove}
          disabled={isCompressing}
        >
          <CloseIcon size={16} color="#fff" />
        </TouchableOpacity>

        {/* Compression Progress Overlay */}
        {isCompressing && (
          <BlurView
            intensity={20}
            tint="dark"
            className="absolute inset-0 items-center justify-center"
          >
            <VStack darkColor="none" className="items-center space-y-3">
              <VideoIcon size={32} color="#fff" />
              <Text className="text-white text-sm font-medium">
                Compressing video...
              </Text>
              <CircularProgress progress={compressionProgress} />
            </VStack>
          </BlurView>
        )}
      </View>
    </VStack>
  );
};
