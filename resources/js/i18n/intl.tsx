import { usePage } from '@inertiajs/react';

import type { SharedData } from '@/types';

import en from './messages/en.json';
import ml from './messages/ml.json';
import type { Locale } from './routing';

/**
 * Minimal replacement for next-intl's useTranslations/useLocale. The message
 * files are the same JSON the Next.js site used (namespaced, dot paths, no
 * interpolation), bundled for both locales since they are tiny.
 */
const messages: Record<Locale, Record<string, unknown>> = { en, ml };

function lookup(tree: unknown, path: string): string | undefined {
    const value = path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], tree);

    return typeof value === 'string' ? value : undefined;
}

export function useLocale(): Locale {
    return usePage<SharedData>().props.locale;
}

export function useTranslations(namespace?: string) {
    const locale = useLocale();

    return (key: string): string => {
        const path = namespace ? `${namespace}.${key}` : key;

        // Malayalam copy is incomplete; fall back to English per key.
        return lookup(messages[locale], path) ?? lookup(messages.en, path) ?? path;
    };
}
