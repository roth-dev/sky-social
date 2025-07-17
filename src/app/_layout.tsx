import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { I18nProviderWrapper } from "@/contexts/I18nProvider";
import { QueryProvider } from "@/contexts/QueryProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Fragment } from "react";
import FontProvider from "@/contexts/FontProvider";
import { isWeb } from "@/platform";

function RootLayout() {
  const { isAuthenticated } = useAuth();

  useFrameworkReady();

  return (
    <Fragment>
      <Stack
        screenOptions={{ headerShown: false, animation: "ios_from_right" }}
      >
        <Stack.Protected guard={isAuthenticated || isWeb}>
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
            <I18nProviderWrapper>
              <GestureHandlerRootView className="flex-1">
                <RootLayout />
              </GestureHandlerRootView>
            </I18nProviderWrapper>
          </FontProvider>
        </AuthProvider>
      </QueryProvider>
    </SettingsProvider>
  );
}
