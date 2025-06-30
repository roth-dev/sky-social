import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { Fragment } from "react";
import "../global.css";

function RootLayout() {
  const { isAuthenticated } = useAuth();

  useFrameworkReady();

  return (
    <Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Always show tabs - authentication is handled within individual screens */}
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
        <SettingsProvider>
          <I18nProvider>
            <GestureHandlerRootView className="flex-1">
              <RootLayout />
            </GestureHandlerRootView>
          </I18nProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryProvider>
  );
}