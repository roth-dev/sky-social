import {
  Inter_900Black,
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_600SemiBold,
  Inter_100Thin,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { PropsWithChildren, useEffect } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function FontProvider({ children }: PropsWithChildren) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_900Black,
    Inter_500Medium,
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_100Thin,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  return <>{children}</>;
}
