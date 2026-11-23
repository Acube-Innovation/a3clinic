/**
 * Types and static values only. Content itself comes from Laravel as page
 * props (App\Support\SiteData), replacing the Next.js async getters.
 */

export type PostCategory =
  | "hair-tips"
  | "homeopathy"
  | "nutrition"
  | "lifestyle"
  | "womens-health"
  | "children";

export const postCategoryLabels: Record<PostCategory, string> = {
  "hair-tips": "Hair Tips",
  homeopathy: "Homeopathy",
  nutrition: "Nutrition",
  lifestyle: "Lifestyle",
  "womens-health": "Women's Health",
  children: "Children",
};

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string };

export type Post = {
  slug: string;
  title: string;
  category: PostCategory;
  /** Cover image uploaded via admin; site falls back to placeholder art. */
  image?: string;
  excerpt: string;
  publishedAt: string;
  readingMinutes: number;
  featured?: boolean;
  body: Block[];
};
