/**
 * Types and static values only. Content itself comes from Laravel as page
 * props (App\Support\SiteData), replacing the Next.js async getters.
 */

export type ConditionCategory =
  | "hair"
  | "skin"
  | "chronic"
  | "womens"
  | "child";

export type ResultPair = {
  before: string;
  after: string;
  /** e.g. "Photographs 6 months apart" — never a patient name. */
  label: string;
  note: string;
};

export type Condition = {
  slug: string;
  name: string;
  category: ConditionCategory;
  /** One-line summary used on cards and in meta descriptions. */
  summary: string;
  /** Longer intro shown at the top of the condition page. */
  intro: string;
  symptoms: string[];
  causes: string[];
  /** How the clinic approaches it. */
  treatment: string[];
  /** Deliberately framed as "what to expect", never as guaranteed outcomes. */
  expectedResults: { phase: string; detail: string }[];
  faqs: { question: string; answer: string }[];
  featured?: boolean;
  /** Watermarked before/after documentation, edited on the condition itself. */
  results?: ResultPair[];
  /** Header background image for the condition page (admin upload). */
  heroImage?: string;
  /** Illustration beside the introduction (admin upload). */
  introImage?: string;
};

/** Complete pairs from a condition (both photos present). */
export function pairsOf(condition: Condition): ResultPair[] {
  return (condition.results ?? []).filter((r) => Boolean(r.before) && Boolean(r.after));
}

export const categoryLabels: Record<ConditionCategory, string> = {
  hair: "Hair & Scalp",
  skin: "Skin",
  chronic: "Chronic & Lifestyle",
  womens: "Women's Health",
  child: "Child Care",
};

/** The fields listing pages need (full records are only sent to detail pages). */
export type ConditionCard = Pick<
  Condition,
  "slug" | "name" | "category" | "summary" | "featured" | "heroImage" | "introImage"
>;
