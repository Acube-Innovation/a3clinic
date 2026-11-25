import type { ClinicSettings } from '@/data/clinic';

export type { Locale } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';

/** Props every Inertia page receives (see HandleInertiaRequests::share). */
export interface SharedData {
    name: string;
    locale: Locale;
    locales: Locale[];
    clinic: ClinicSettings;
    /** Every condition (name, category, featured flag): the Treatments mega-menu. */
    navConditions: { slug: string; name: string; category: string; featured: boolean }[];
    [key: string]: unknown;
}
