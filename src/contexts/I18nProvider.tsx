import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { I18nProvider } from "@lingui/react";
import { detectLocale, LocalizCode } from "@/i18n/config";
import { i18n } from "@lingui/core";
import { loadCatalog } from "@/i18n/loader";
import { storage } from "@/lib/storage";
import {
  KantumruyPro_700Bold,
  KantumruyPro_100Thin,
  KantumruyPro_500Medium,
  KantumruyPro_600SemiBold,
  useFonts,
  KantumruyPro_400Regular,
} from "@expo-google-fonts/kantumruy-pro";
import { SplashScreen } from "expo-router";

type I18nContextType = {
  locale: LocalizCode;
  changeLocale: (newLocale: LocalizCode) => Promise<void>;
};

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  changeLocale: async () => {},
});

export const I18nProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [locale, setLocale] = useState<LocalizCode>("en");
  const [ready, setReady] = useState(false);

  const [fontsLoaded] = useFonts({
    KantumruyPro_700Bold,
    KantumruyPro_100Thin,
    KantumruyPro_500Medium,
    KantumruyPro_600SemiBold,
    KantumruyPro_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const init = async () => {
      let initialLocale = detectLocale();
      try {
        const savedLanguage = await storage.getLanguage();
        if (savedLanguage) {
          initialLocale = savedLanguage;
        }
      } catch (e) {
        console.log(e);
      }
      await loadCatalog(initialLocale);
      i18n.activate(initialLocale);
      setLocale(initialLocale);
      setReady(true);
    };
    init();
  }, []);

  const changeLocale = useCallback(
    async (newLocale: LocalizCode) => {
      if (locale === newLocale) return;
      await loadCatalog(newLocale);
      i18n.activate(newLocale);
      setLocale(newLocale);
    },
    [locale]
  );
  if (!ready || !fontsLoaded) return null;

  return (
    <I18nContext.Provider value={{ locale, changeLocale }}>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
