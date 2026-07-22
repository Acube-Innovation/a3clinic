import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Session-specific and personal-health routes stay out of the index.
      disallow: ["/api/", "/*/cart", "/*/portal"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
