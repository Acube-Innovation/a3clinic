import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Admin image uploads go through a server action; Next's default body
      // limit is 1 MB, which silently rejects normal photos before our own
      // 5 MB check can run. 8 MB leaves headroom over that check.
      bodySizeLimit: "8mb",
    },
  },
  images: {
    // Real clinic/product photography will be dropped into /public or served from a
    // CDN later. Add the CDN host to `remotePatterns` at that point (`domains` is
    // deprecated in Next 16).
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        // Admin uploads in public/uploads have immutable UUID filenames — cache
        // them hard, matching what the old serving route set.
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
