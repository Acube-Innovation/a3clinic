import { Head, usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';

import { FloatingActions } from '@/components/layout/FloatingActions';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { useTranslations } from '@/i18n/intl';
import { CartProvider } from '@/lib/cart-context';
import { phoneDisplayOf, phoneIntlOf, waHrefOf } from '@/lib/site';
import type { SharedData } from '@/types';

/**
 * Public site chrome — the body of the Next.js [locale]/layout.tsx. Used as
 * Inertia's persistent layout, so the header, cart and floating actions stay
 * mounted across page visits.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
    const { clinic, navConditions, title, locale } = usePage<SharedData & { title?: string }>().props;
    const t = useTranslations('nav');

    // The server sets <html lang> on the first load; keep it right after
    // client-side locale switches.
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const phone = { intl: phoneIntlOf(clinic.phone), display: phoneDisplayOf(clinic.phone) };
    const whatsappHref = waHrefOf(clinic.whatsapp, "Hello Dr. Riji's Health Care, I would like to book a consultation.");

    // The mobile Treatments list: every condition marked "Featured" in the
    // admin, framed by the programme link and the full index. Desktop shows
    // the full mega-menu from `navConditions`.
    const treatmentsMenu = [
        { label: t('hairTreatment'), href: '/hair-treatment' },
        ...navConditions.filter((condition) => condition.featured).map((condition) => ({ label: condition.name, href: `/conditions/${condition.slug}` })),
        { label: t('results'), href: '/results' },
        { label: t('allConditions'), href: '/conditions' },
    ];

    return (
        <>
            {title ? <Head title={title} /> : null}
            <a
                href="#main"
                className="sr-only rounded-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
            >
                {t('skipToContent')}
            </a>
            <CartProvider>
                <Header treatments={treatmentsMenu} conditions={navConditions} phone={phone} whatsappHref={whatsappHref} />
                <main id="main" className="flex-1">
                    {children}
                </main>
                <Footer />
                <FloatingActions whatsappHref={whatsappHref} />
            </CartProvider>
        </>
    );
}
