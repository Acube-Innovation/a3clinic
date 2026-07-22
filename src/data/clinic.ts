/**
 * Clinic contact details, hours and headline stats — admin-editable via the
 * "Clinic & Contact" workspace (content/clinic.json), with these defaults.
 *
 * Server-only (reads the store). Client components receive values as props;
 * the phone/WhatsApp formatting helpers live in src/lib/site.ts (client-safe).
 */

import { readDoc } from "@/lib/admin/store";

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

const defaults: ClinicSettings = {
  phone: "9645119355",
  whatsapp: "9645119355",
  email: "care@drrijishealthcare.com",
  addressLine1: "Dr. Riji's Health Care",
  addressLine2: "Main Road, Kattakkada",
  city: "Kattakkada",
  district: "Thiruvananthapuram",
  state: "Kerala",
  postalCode: "695572",
  hours: [
    { days: "Monday – Saturday", time: "9:00 AM – 1:00 PM" },
    { days: "Monday – Saturday", time: "4:00 PM – 7:30 PM" },
    { days: "Sunday", time: "Online consultation only" },
  ],
  mapQuery: "",
  stats: [
    { value: 12, suffix: "+", label: "Years in practice" },
    { value: 9000, suffix: "+", label: "Consultations completed" },
    { value: 40, suffix: "+", label: "Countries consulted online" },
    { value: 9, suffix: "", label: "Doctor-formulated products" },
  ],
};

export async function getClinicSettings(): Promise<ClinicSettings> {
  const stored = await readDoc<Partial<ClinicSettings>>("clinic", defaults);
  // Merge over defaults so a partially-saved doc never removes a field.
  return { ...defaults, ...stored };
}

/** The raw defaults, used by the admin panel to seed first-time edits. */
export function getClinicDefaults(): ClinicSettings {
  return structuredClone(defaults);
}
