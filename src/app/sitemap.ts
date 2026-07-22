import type { MetadataRoute } from "next";

import { site } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { getConditionSlugs } from "@/data/conditions";
import { getProductSlugs } from "@/data/products";
import { getPostSlugs } from "@/data/posts";

/**
 * Every public route in both locales, each with hreflang alternates so Google
 * treats /en and /ml as translations rather than duplicates.
 * `/cart` and `/portal` are excluded — both are noindex.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [conditions, products, posts] = await Promise.all([
    getConditionSlugs(),
    getProductSlugs(),
    getPostSlugs(),
  ]);

  const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/hair-treatment", priority: 0.9, changeFrequency: "monthly" },
    { path: "/conditions", priority: 0.8, changeFrequency: "monthly" },
    { path: "/shop", priority: 0.8, changeFrequency: "weekly" },
    { path: "/consultation", priority: 0.8, changeFrequency: "monthly" },
    { path: "/book", priority: 0.9, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "yearly" },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    ...conditions.map((slug) => ({
      path: `/conditions/${slug}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    ...products.map((slug) => ({
      path: `/shop/${slug}`,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    })),
    ...posts.map((slug) => ({
      path: `/blog/${slug}`,
      priority: 0.6,
      changeFrequency: "monthly" as const,
    })),
  ];

  const lastModified = new Date();

  return routes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: `${site.url}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, `${site.url}/${alt}${route.path}`]),
        ),
      },
    })),
  );
}
