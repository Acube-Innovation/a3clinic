import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import SiteLayout from './layouts/SiteLayout';

type PageModule = { default: { layout?: (page: ReactNode) => ReactNode } };

createInertiaApp({
    // Controllers send the complete title (the home page has no site-name suffix).
    title: (title) => title || "Dr. Riji's Health Care",
    resolve: async (name) => {
        const page = await resolvePageComponent<PageModule>(`./pages/${name}.tsx`, import.meta.glob<PageModule>('./pages/**/*.tsx'));
        // Public pages share the persistent site chrome unless they set their own.
        page.default.layout ??= (child) => <SiteLayout>{child}</SiteLayout>;

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#044B4D',
    },
});
