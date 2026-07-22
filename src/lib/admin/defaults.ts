import "server-only";

import { getProductDefaults } from "@/data/products";
import { getConditionDefaults } from "@/data/conditions";
import { getPostDefaults } from "@/data/posts";
import { getTestimonialDefaults } from "@/data/testimonials";

export type AnyRecord = Record<string, unknown>;

/** In-code default content per collection, for first-run reads in admin pages. */
export function defaultsForCollection(key: string): AnyRecord[] {
  switch (key) {
    case "products":
      return getProductDefaults() as unknown as AnyRecord[];
    case "conditions":
      return getConditionDefaults() as unknown as AnyRecord[];
    case "posts":
      return getPostDefaults() as unknown as AnyRecord[];
    case "testimonials":
      return getTestimonialDefaults() as unknown as AnyRecord[];
    default:
      return [];
  }
}
