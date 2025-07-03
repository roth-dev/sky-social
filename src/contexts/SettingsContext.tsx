import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
  useCallback,
  useMemo,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { storage } from "@/lib/storage";
import { colorScheme } from "nativewind";

export type Language = "en" | "km";
export type ThemeMode = "light" | "dark" | "system";
export type ColorScheme = "light" | "dark";

interface SettingsContextType {
  language: Language;
  colorScheme: ColorScheme;
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setLanguage: (language: Language) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>("en");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Calculate if dark mode should be active
  const isDarkMode = useMemo(() => {
    return (
      themeMode === "dark" ||
      (themeMode === "system" && systemColorScheme === "dark")
    );
  }, [themeMode, systemColorScheme]);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      ({ colorScheme: scheme }) => {
        colorScheme.set(scheme as ThemeMode);
        setSystemColorScheme(scheme);
      }
    );

    return () => subscription?.remove();
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    if (isDarkMode) {
      colorScheme.set("dark");
    } else {
      colorScheme.set("light");
    }
  }, [isDarkMode]);

  const loadSettings = useCallback(async () => {
    try {
      const savedLanguage = await storage.getLanguage();
      const savedThemeMode = await storage.getThemeMode();

      if (savedLanguage) {
        setLanguageState(savedLanguage);
      }
      if (savedThemeMode) {
        setThemeModeState(savedThemeMode);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await storage.saveLanguage(newLanguage);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      colorScheme.set(mode);
      await storage.saveThemeMode(mode);
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  }, []);

  const currentScheme = useMemo(() => {
    return isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  return (
    <SettingsContext.Provider
      value={{
        language,
        themeMode,
        isDarkMode,
        setLanguage,
        setThemeMode,
        colorScheme: currentScheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
