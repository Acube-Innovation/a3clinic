/**
 * Types and static values only. Content itself comes from Laravel as page
 * props (App\Support\SiteData), replacing the Next.js async getters.
 */

export type ConsultationContent = {
  prepare: { title: string; detail: string }[];
  deliveryNote: string;
};
