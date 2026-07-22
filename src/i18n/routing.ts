import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for locales. `ml` (Malayalam) is routable today but its
 * message file currently falls back to English copy — see messages/ml.json.
 */
export const routing = defineRouting({
  locales: ["en", "ml"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ml: "മലയാളം",
};
