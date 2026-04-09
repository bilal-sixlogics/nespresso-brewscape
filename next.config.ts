import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable dynamic rendering for product pages, accounts, and real-time data
  // Remove static export to support:
  // - Dynamic routes (/shop/[slug], /blog/[id], /account)
  // - ISR (Incremental Static Regeneration)
  // - Real-time data updates
  images: {
    // Enable Next.js image optimization
    // Provides: automatic resizing, WebP conversion, responsive images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
