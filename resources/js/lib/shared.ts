import { usePage } from '@inertiajs/react';

import type { ClinicSettings } from '@/data/clinic';
import type { SharedData } from '@/types';

/**
 * Clinic settings shared with every page (HandleInertiaRequests), replacing
 * the server-side getClinicSettings() calls in layout components.
 */
export function useClinic(): ClinicSettings {
    return usePage<SharedData>().props.clinic;
}
