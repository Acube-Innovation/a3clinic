/**
 * Types and static values only. Content itself comes from Laravel as page
 * props (App\Support\SiteData), replacing the Next.js async getters.
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
