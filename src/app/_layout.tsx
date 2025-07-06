import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Fragment } from "react";
import "../global.css";
import FontProvider from "@/contexts/FontProvider";

function RootLayout() {
  const { isAuthenticated } = useAuth();

  useFrameworkReady();

  return (
    <Fragment>
      <Stack
        screenOptions={{ headerShown: false, animation: "ios_from_right" }}
      >
        {/* Always show tabs - authentication is handled within individual screens */}
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: "fade_from_bottom",
              animationTypeForReplace: "push",
            }}
          />
          <Stack.Screen
            name="(modal)"
            options={{
              presentation: "modal",
              gestureEnabled: false,
              gestureDirection: "vertical",
            }}
          />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="login" />
        </Stack.Protected>

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </Fragment>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <QueryProvider>
        <AuthProvider>
          <FontProvider>
            <I18nProvider>
              <GestureHandlerRootView className="flex-1">
                <RootLayout />
              </GestureHandlerRootView>
            </I18nProvider>
          </FontProvider>
        </AuthProvider>
      </QueryProvider>
    </SettingsProvider>
  );
}
