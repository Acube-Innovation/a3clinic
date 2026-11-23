import type { ClinicSettings } from '@/data/clinic';

export type { Locale } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';

/** Props every Inertia page receives (see HandleInertiaRequests::share). */
export interface SharedData {
    name: string;
    locale: Locale;
    locales: Locale[];
    clinic: ClinicSettings;
    /** Conditions marked "featured": the header's Treatments dropdown. */
    navConditions: { slug: string; name: string }[];
    [key: string]: unknown;
}
