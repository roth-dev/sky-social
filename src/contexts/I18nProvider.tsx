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

  useEffect(() => {
    const init = async () => {
      const systemLocale = detectLocale();
      await loadCatalog(systemLocale);
      i18n.activate(systemLocale);
      setLocale(systemLocale);
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
  if (!ready) return null;

  return (
    <I18nContext.Provider value={{ locale, changeLocale }}>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
