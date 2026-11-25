import { Link as InertiaLink, router, usePage } from '@inertiajs/react';
import type { ComponentProps } from 'react';

import { useLocale } from './intl';
import { routing, type Locale } from './routing';

/**
 * Locale-aware Link / usePathname / useRouter, replacing next-intl's
 * createNavigation(). Hrefs are written without the locale ("/shop") and the
 * current locale is prefixed, exactly as before.
 */

const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`);

/** Prefix an internal path with a locale; external/hash/mailto links pass through. */
export function localizeHref(href: string, locale: Locale): string {
    if (!href.startsWith('/') || href.startsWith('//')) {
        return href;
    }

    // "/", "/#section" and "/?q" all mean the home page: "/en", "/en#section".
    // "/en/#section" would redirect to "/en" and lose the anchor.
    return `/${locale}${href === '/' || /^\/[?#]/.test(href) ? href.slice(1) : href}`;
}

/** The current path without its locale prefix ("/en/shop" -> "/shop"). */
export function stripLocale(path: string): string {
    return path.replace(LOCALE_PREFIX, '') || '/';
}

/** Anchor attributes (as next/link accepted) plus the Inertia visit options we use. */
type LinkProps = Omit<ComponentProps<'a'>, 'href'> & {
    href: string;
    locale?: Locale;
    replace?: boolean;
    preserveScroll?: boolean;
    prefetch?: boolean;
};

export function Link({ href, locale, replace, preserveScroll, prefetch, ...props }: LinkProps) {
    const current = useLocale();
    const target = localizeHref(href, locale ?? current);

    // Plain anchors for non-app targets (tel:, mailto:, #hash, external URLs),
    // and for an anchor on the current page, so the browser just scrolls.
    const [targetPath, hash] = target.split('#');
    const currentPath = usePage().url.split(/[?#]/)[0];
    const onThisPage = hash !== undefined && currentPath === targetPath;
    if (!target.startsWith('/') || onThisPage) {
        return <a href={target} {...props} />;
    }

    return <InertiaLink href={target} replace={replace} preserveScroll={preserveScroll} prefetch={prefetch} {...(props as object)} />;
}

export function usePathname(): string {
    return stripLocale(usePage().url.split(/[?#]/)[0]);
}

export function useSearchParams(): URLSearchParams {
    const url = usePage().url;

    return new URLSearchParams(url.includes('?') ? url.slice(url.indexOf('?') + 1).split('#')[0] : '');
}

type NavigateOptions = { scroll?: boolean; locale?: Locale };

export function useRouter() {
    const current = useLocale();

    const go = (method: 'push' | 'replace') => (href: string, options: NavigateOptions = {}) =>
        router.visit(localizeHref(href, options.locale ?? current), {
            replace: method === 'replace',
            preserveScroll: options.scroll === false,
            preserveState: options.scroll === false,
        });

    return {
        push: go('push'),
        replace: go('replace'),
        refresh: () => router.reload(),
        back: () => window.history.back(),
    };
}
