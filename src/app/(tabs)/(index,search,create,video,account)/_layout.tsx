import { Stack } from "@/app/_layout";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { isAndroid } from "@/platform";
import React from "react";
import { interpolate, interpolateColor } from "react-native-reanimated";
import Transition from "react-native-screen-transitions";

export const unstable_settings = {
  initialRouteName: "index",
  search: {
    initialRouteName: "search",
  },
  create: {
    initialRouteName: "create",
  },
  video: {
    initialRouteName: "video",
  },
  account: {
    initialRouteName: "account",
  },
};

export default function TabLayout() {
  const { colorScheme } = useSettings();
  return (
    <Stack
      screenOptions={{
        gestureDirection: "horizontal",
        animation: isAndroid ? "none" : "slide_from_right",
        headerStyle: {
          backgroundColor: Colors.background.primary[colorScheme],
        },
        headerTitleStyle: {
          fontSize: 16,
          fontFamily: "Inter_600SemiBold",
        },
        headerShown: false,
        // headerLeft: () => (isIOS ? <BackButton /> : undefined),
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="create" />
      <Stack.Screen name="video" />
      <Stack.Screen name="account" />
      <Stack.Screen
        name="viewer/image-post"
        options={{
          headerShown: false,
          enableTransitions: true,
          gestureEnabled: true,
          gestureDirection: ["vertical", "vertical-inverted"],
          gestureDrivesProgress: false,
          screenStyleInterpolator: ({
            focused,
            activeBoundId,
            bounds,
            current,
          }) => {
            "worklet";
            if (focused && activeBoundId) {
              const boundStyles = bounds().transform().build();

              return {
                [activeBoundId]: {
                  ...boundStyles,
                  borderRadius: interpolate(current.progress, [0, 1], [12, 0]),
                  overflow: "hidden",
                },
                contentStyle: {
                  transform: [
                    {
                      translateY: current.gesture.y,
                    },
                  ],
                },
                overlayStyle: {
                  backgroundColor: interpolateColor(
                    current.progress - Math.abs(current.gesture.normalizedY),
                    [0, 1],
                    ["rgba(0,0,0,0)", "rgba(0,0,0,1)"]
                  ),
                },
              };
            }

            return {};
          },
          transitionSpec: {
            open: Transition.specs.DefaultSpec,
            close: Transition.specs.DefaultSpec,
          },
        }}
      />
    </Stack>
  );
}
