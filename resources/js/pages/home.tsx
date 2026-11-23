import { Head, usePage } from '@inertiajs/react';

import type { SharedData } from '@/types';

/**
 * Phase 1 placeholder: proves the brand theme, fonts and locale routing are
 * wired up. Replaced by the real home page (ported sections) in Phase 3.
 */
export default function Home() {
    const { locale } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Home" />
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6 px-6 py-24">
                <p className="text-eyebrow font-semibold uppercase text-olive-600">Laravel rebuild · {locale}</p>
                <h1 className="font-display text-display text-teal-800">Healthy Hair. Whole-body Healing.</h1>
                <p className="max-w-2xl text-lead text-muted">
                    Homeopathic care for hair fall, scalp disorders, skin conditions and chronic illness.
                </p>
                <div className="flex gap-3">
                    <span className="rounded-full bg-teal-800 px-6 py-3 text-sm font-semibold text-white">Book a consultation</span>
                    <span className="rounded-full border border-line bg-platinum px-6 py-3 text-sm font-semibold text-ink">Explore treatments</span>
                </div>
            </main>
        </>
    );
}
