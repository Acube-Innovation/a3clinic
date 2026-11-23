export type Locale = 'en' | 'ml';

/** Props every Inertia page receives (see HandleInertiaRequests::share). */
export interface SharedData {
    name: string;
    locale: Locale;
    locales: Locale[];
    [key: string]: unknown;
}
