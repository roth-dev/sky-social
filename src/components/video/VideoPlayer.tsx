import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Alert } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useViewportDetection } from '@/hooks/useViewportDetection';

interface VideoPlayerProps {
  uri: string;
  thumbnail?: string;
  aspectRatio?: { width: number; height: number };
  isDetailView?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function VideoPlayer({
  uri,
  thumbnail,
  aspectRatio,
  isDetailView = false,
  autoPlay = true,
  muted = true,
  onPlaybackStatusUpdate,
}: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Viewport detection for auto-play
  const { isInViewport, viewRef } = useViewportDetection({ threshold: 0.6 });

  // Animation values
  const controlsOpacity = useSharedValue(0);
  const playButtonScale = useSharedValue(1);
  const progressValue = useSharedValue(0);

  // Calculate video dimensions
  const calculateDimensions = () => {
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
  };

  const dimensions = calculateDimensions();

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay || !videoRef.current) return;

    if (isInViewport && !isPlaying && !hasError) {
      handlePlay();
    } else if (!isInViewport && isPlaying) {
      handlePause();
    }
  }, [isInViewport, autoPlay]);

  // Controls animation
  useEffect(() => {
    controlsOpacity.value = withTiming(showControls ? 1 : 0, { duration: 200 });
  }, [showControls]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Update progress animation
      const progress = status.durationMillis 
        ? (status.positionMillis || 0) / status.durationMillis 
        : 0;
      progressValue.value = progress;

      // Handle video end
      if (status.didJustFinish) {
        setIsPlaying(false);
        setShowControls(true);
      }
    } else if (status.error) {
      console.error('Video playback error:', status.error);
      setHasError(true);
      setIsLoading(false);
    }

    onPlaybackStatusUpdate?.(status);
  };

  const handlePlay = async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.playAsync();
        setIsPlaying(true);
        playButtonScale.value = withTiming(1.2, { duration: 100 }, () => {
          playButtonScale.value = withTiming(1, { duration: 100 });
        });
      }
    } catch (error) {
      console.error('Error playing video:', error);
      setHasError(true);
    }
  };

  const handlePause = async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error pausing video:', error);
    }
  };

  const handleTogglePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleToggleMute = async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleVideoPress = () => {
    setShowControls(!showControls);
  };

  const handleFullscreen = () => {
    Alert.alert('Fullscreen', 'Fullscreen mode will be available in a future update.');
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Animated styles
  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(
      progressValue.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    )}%`,
  }));

  if (hasError) {
    return (
      <View style={[styles.container, { height: dimensions.height }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load video</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View 
      ref={viewRef}
      style={[styles.container, { height: dimensions.height }]}
    >
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri }}
          style={[styles.video, dimensions]}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping={false}
          isMuted={isMuted}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          posterSource={thumbnail ? { uri: thumbnail } : undefined}
          usePoster={!!thumbnail}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingSpinner} />
          </View>
        )}

        {/* Controls Overlay */}
        <Animated.View style={[styles.controlsOverlay, controlsAnimatedStyle]}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Video</Text>
            </View>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleFullscreen}>
              <Maximize2 size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Center Play Button */}
          <View style={styles.centerControls}>
            <Animated.View style={playButtonAnimatedStyle}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handleTogglePlayPause}
              >
                {isPlaying ? (
                  <Pause size={32} color="#ffffff" fill="#ffffff" />
                ) : (
                  <Play size={32} color="#ffffff" fill="#ffffff" />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressBar, progressBarStyle]} />
              </View>
              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleToggleMute}>
              {isMuted ? (
                <VolumeX size={20} color="#ffffff" />
              ) : (
                <Volume2 size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Tap to Play Overlay (when paused) */}
        {!isPlaying && !showControls && !isLoading && (
          <View style={styles.tapToPlayOverlay}>
            <TouchableOpacity style={styles.tapToPlayButton} onPress={handleTogglePlayPause}>
              <Play size={48} color="#ffffff" fill="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  liveText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  centerControls: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  progressContainer: {
    flex: 1,
    gap: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapToPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  tapToPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});