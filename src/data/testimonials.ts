/**
 * Patient testimonials.
 *
 * ⚠️ COMPLIANCE: India's Drugs & Magic Remedies (Objectionable Advertisements)
 * Act 1954 and NMC advertising regulations restrict testimonials and outcome
 * claims by medical practitioners. These entries are illustrative placeholders
 * written to be as low-risk as possible — they describe experience of care
 * rather than claiming cures, and they carry no before/after metrics.
 *
 * Before launch the clinic must (a) obtain written, signed consent from every
 * real patient quoted, (b) have this section reviewed by its own legal counsel.
 * See README.md.
 */

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  location: string;
  context: string;
  /** Whether the patient consented to their full name being shown. */
  consentOnFile: boolean;
};

import { readDoc } from "@/lib/admin/store";

const defaults: Testimonial[] = [
  {
    id: "t1",
    quote:
      "What I valued most was that the first consultation was almost an hour. Nobody had previously asked me about my sleep, my diet or my thyroid history — they had only looked at my scalp.",
    author: "Meera S.",
    location: "Thiruvananthapuram",
    context: "Consulting since 2025 · Hair fall",
    consentOnFile: false,
  },
  {
    id: "t2",
    quote:
      "I live in Dubai and consult online. Reports are uploaded before the call, the prescription arrives afterwards and the medicines reach me within the week. It has been genuinely practical.",
    author: "Fathima N.",
    location: "Dubai, UAE",
    context: "Online consultation · Scalp condition",
    consentOnFile: false,
  },
  {
    id: "t3",
    quote:
      "Dr. Riji told me at the first visit that part of my greying was genetic and would not reverse. I appreciated being told that rather than being sold a package.",
    author: "Rahul M.",
    location: "Kattakkada",
    context: "Consulting since 2024 · Premature greying",
    consentOnFile: false,
  },
  {
    id: "t4",
    quote:
      "My daughter is seven and was anxious about seeing any doctor. The consultation was unhurried and she was spoken to directly rather than about. That mattered more than I expected.",
    author: "Anjali R.",
    location: "Kollam",
    context: "Paediatric consultation · Recurrent allergy",
    consentOnFile: false,
  },
  {
    id: "t5",
    quote:
      "The follow-up photographs are what convinced me. I could not judge my own progress month to month, but the comparison at six months was clear.",
    author: "Divya K.",
    location: "Neyyattinkara",
    context: "Consulting since 2025 · Hair thinning",
    consentOnFile: false,
  },
  {
    id: "t6",
    quote:
      "I was asked to get thyroid and ferritin tests before any medicine was prescribed. It turned out my ferritin was very low. That alone changed things.",
    author: "Sreelakshmi P.",
    location: "Thiruvananthapuram",
    context: "Consulting since 2026 · Hair fall with anaemia",
    consentOnFile: false,
  },
];

export async function getTestimonials(): Promise<Testimonial[]> {
  return readDoc<Testimonial[]>("testimonials", defaults);
}

/** The raw defaults, used by the admin panel to seed first-time edits. */
export function getTestimonialDefaults(): Testimonial[] {
  return structuredClone(defaults);
}

/**
 * Headline clinic figures.
 * TODO(client): every number below must be replaced with a verified figure
 * from clinic records before launch. Publishing unverifiable statistics is
 * both an advertising-standards risk and a trust risk.
 */
export const clinicStats = [
  { value: 12, suffix: "+", label: "Years in practice" },
  { value: 9000, suffix: "+", label: "Consultations completed" },
  { value: 40, suffix: "+", label: "Countries consulted online" },
  { value: 9, suffix: "", label: "Doctor-formulated products" },
];
