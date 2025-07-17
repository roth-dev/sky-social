import * as Localization from "expo-localization";

export interface ILocalization {
  en: string;
  km: string;
}

export type LocalizCode = keyof ILocalization;

export const locales: ILocalization = {
  en: "English",
  km: "Khmer",
};

export function detectLocale(): LocalizCode {
  const preferred = Localization.getLocales()[0];
  const languageCode = (preferred?.languageCode || "en") as LocalizCode;
  return Object.keys(locales).includes(languageCode) ? languageCode : "en";
}
