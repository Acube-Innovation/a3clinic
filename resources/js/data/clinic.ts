/**
 * Types and static values only. Content itself comes from Laravel as page
 * props (App\Support\SiteData), replacing the Next.js async getters.
 */

export type ClinicSettings = {
  /** 10-digit mobile, optionally with +91 — helpers normalise it. */
  phone: string;
  /** WhatsApp number, usually the same. */
  whatsapp: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  hours: { days: string; time: string }[];
  /** Optional Google Maps query override; falls back to the address. */
  mapQuery: string;
  /** Homepage counters. Values must be verifiable from clinic records. */
  stats: { value: number; suffix: string; label: string }[];
};
