import "../global.css";
import { SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { I18nProviderWrapper } from "@/contexts/I18nProvider";
import { QueryProvider } from "@/contexts/QueryProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Fragment } from "react";
import { isWeb } from "@/platform";
import ComposerProvider from "@/contexts/ComposserProvider";
import { DialogProvider } from "@/components/ui";
import type {
  ParamListBase,
  StackNavigationState,
} from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import {
  createNativeStackNavigator,
  type NativeStackNavigationEventMap,
  type NativeStackNavigationOptions,
} from "react-native-screen-transitions";

const { Navigator } = createNativeStackNavigator();

export const Stack = withLayoutContext<
  NativeStackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  NativeStackNavigationEventMap
>(Navigator);

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { isAuthenticated } = useAuth();

  useFrameworkReady();

  return (
    <Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated || isWeb}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animationTypeForReplace: "push",
            }}
          />
          <Stack.Screen
            name="(modal)"
            options={{
              presentation: "modal",
              gestureEnabled: false,
              gestureDirection: ["horizontal", "vertical"],
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
          <I18nProviderWrapper>
            <GestureHandlerRootView className="flex-1">
              <ComposerProvider>
                <DialogProvider>
                  <RootLayout />
                </DialogProvider>
              </ComposerProvider>
            </GestureHandlerRootView>
          </I18nProviderWrapper>
        </AuthProvider>
      </QueryProvider>
    </SettingsProvider>
  );
}
