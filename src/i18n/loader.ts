import { i18n } from "@lingui/core";

export async function loadCatalog(locale: string) {
  switch (locale) {
    case "km":
      return import("../../locale/km/messages.mjs").then((mod) =>
        i18n.load({ km: mod.messages })
      );
    default:
      return import("../../locale/en/messages.mjs").then((mod) =>
        i18n.load({ en: mod.messages })
      );
  }
}
