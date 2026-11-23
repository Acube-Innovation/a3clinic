/**
 * Client-safe product metadata: types and labels only, no data access.
 * Client components import from here; src/data/products.ts (server-only,
 * reads the content store) re-exports these for server callers.
 */

export type ProductCategory =
  | "hair-oil"
  | "hair-serum"
  | "shampoo"
  | "conditioner"
  | "hair-kit"
  | "skin-care"
  | "medicine"
  | "supplements";

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  /** Product photo uploaded via admin; site falls back to placeholder art. */
  image?: string;
  tagline: string;
  description: string;
  price: number; // paise
  compareAtPrice?: number; // paise — shown struck through
  size: string;
  inStock: boolean;
  featured?: boolean;
  bestseller?: boolean;
  benefits: string[];
  ingredients: { name: string; role: string }[];
  directions: string[];
  /** Shown verbatim on the product page. Required for anything applied to skin. */
  caution: string;
  rating: { value: number; count: number };
  reviews: {
    author: string;
    location: string;
    rating: number;
    date: string;
    title: string;
    body: string;
  }[];
  related: string[];
};

export const categoryLabels: Record<ProductCategory, string> = {
  "hair-oil": "Hair Oil",
  "hair-serum": "Hair Serum",
  shampoo: "Shampoo",
  conditioner: "Conditioner",
  "hair-kit": "Hair Kit",
  "skin-care": "Skin Care",
  medicine: "Medicine",
  supplements: "Supplements",
};

export const categoryOrder: ProductCategory[] = [
  "hair-oil",
  "hair-serum",
  "shampoo",
  "conditioner",
  "hair-kit",
  "skin-care",
  "medicine",
  "supplements",
];
