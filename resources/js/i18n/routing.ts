/**
 * Single source of truth for locales on the client (mirrors config/app.php
 * `locales`). `ml` (Malayalam) is routable; its message file currently falls
 * back to English copy — see messages/ml.json.
 */
export const routing = {
    locales: ['en', 'ml'] as const,
    defaultLocale: 'en' as const,
};

export type Locale = (typeof routing.locales)[number];

export const localeLabels: Record<Locale, string> = {
    en: 'English',
    ml: 'മലയാളം',
};
