import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { Fragment } from "react";

function RootLayout() {
  const { isAuthenticated } = useAuth();

  useFrameworkReady();

  return (
    <Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        {/* <Stack.Protected guard={loading}>
          <Stack.Screen name="splash" />
        </Stack.Protected> */}

        <Stack.Protected guard={isAuthenticated || Platform.OS === "web"}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: "fade_from_bottom",
              animationTypeForReplace: "push",
            }}
          />
          <Stack.Screen name="post/[uri]" options={{ headerShown: false }} />
          <Stack.Screen
            name="profile/[handle]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="search/people" options={{ headerShown: false }} />
          <Stack.Screen name="search/feeds" options={{ headerShown: false }} />
          <Stack.Screen name="feed/[uri]" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </Fragment>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayout />
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryProvider>
  );
}
