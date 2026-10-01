import type { NextConfig } from "next";

/**
 * Security response headers.
 *
 * The site previously sent none of these, while advertising `X-Powered-By:
 * Next.js`. For a store that takes card payments that is both a hardening gap
 * and a trust signal problem.
 *
 * Applied to every route via `headers()` below. Nothing here changes rendering,
 * routing or checkout behaviour — these are response headers only.
 */
const SECURITY_HEADERS = [
    {
        // Two years, subdomains included, and preload-eligible. Safe because
        // the site already redirects http -> https and www -> apex, so there is
        // no http-only host left to lock out.
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    {
        // Stops browsers MIME-sniffing a response into something executable.
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        // Clickjacking. SAMEORIGIN rather than DENY: this governs who may frame
        // *us*, not which iframes we may embed, so the Stripe payment iframe is
        // unaffected.
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
    },
    {
        // Send the full URL same-origin, origin only cross-origin. Keeps
        // referral attribution working for outbound links without leaking
        // cart or account paths to third parties.
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        // Drop ambient access to hardware the storefront never asks for.
        // `payment=(self)` is deliberate — revoking it would break the Payment
        // Request API that Stripe uses for Apple Pay / Google Pay.
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self)",
    },
];

/**
 * Content-Security-Policy, in **Report-Only** mode.
 *
 * Deliberately not enforced yet. An enforcing CSP on a page that loads Stripe,
 * Google Analytics/Consent Mode and remote catalogue images is the single
 * easiest way to silently break checkout, and this task has no mandate to touch
 * payment behaviour. Report-Only surfaces every violation in the browser
 * console (and to `report-uri`, if one is added) while blocking nothing.
 *
 * To enforce later: watch the console on the homepage, a product page and a
 * full checkout run, fold in whatever legitimately reports, then rename the
 * header to `Content-Security-Policy`.
 *
 * `'unsafe-inline'`/`'unsafe-eval'` are present because Next.js injects inline
 * hydration and the Consent Mode default snippet runs `beforeInteractive`.
 * Tightening those requires a nonce pipeline, which is a separate piece of work.
 */
const CSP_REPORT_ONLY = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://js.stripe.com https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.cafrezzo.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.stripe.com https://www.facebook.com https://connect.facebook.net",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // NOTE: do not add `turbopack.root` here.
  //
  // If there is a stray package-lock.json above this directory (a developer's
  // home folder is the usual culprit), Next logs "inferred your workspace
  // root, but it may not be correct" on every run. The obvious fix is to pin
  // `turbopack: { root: process.cwd() }` — don't. It silences the warning and
  // breaks route resolution outright: every route, including /fr, then returns
  // 404 in `next dev`. Verified by A/B test.
  //
  // The warning is cosmetic. Remove the stray lockfile instead.
  //
  // Related: don't run `next build` and `next dev` against the same .next
  // directory — the mixed artifacts make dev 404 every route below /[locale].
  // `npm run dev:clean` exists for that.

  // Removes `X-Powered-By: Next.js`. Naming the framework and its version in
  // every response tells an attacker which CVE list to work through and buys
  // nothing in return.
  poweredByHeader: false,

  // Enable dynamic rendering for product pages, accounts, and real-time data
  // Remove static export to support:
  // - Dynamic routes (/shop/[slug], /journal/[slug], /account)
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
    // AVIF first (~20-30% smaller than WebP for product photography), WebP
    // for browsers without it. Default is WebP only.
    formats: ["image/avif", "image/webp"],
    // How long an optimised rendition is cached — on disk here, and in the
    // browser via the Cache-Control it is served with. Default is 4 hours.
    // Catalogue uploads are UUID-named (api.cafrezzo.com/storage/uploads/
    // <uuid>.jpg): a new photo is a new URL, so a long TTL never serves a
    // stale image. The upstream sends no Cache-Control at all, so without this
    // every visitor re-downloads every product photo.
    minimumCacheTTL: 2592000, // 30 days
  },

  async headers() {
    return [
      {
        // Every route, including /sitemap.xml, /robots.txt and the API-backed
        // pages. Static assets under /_next are served by the same handler and
        // inherit these too.
        source: "/:path*",
        headers: [
          ...SECURITY_HEADERS,
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
        ],
      },
      // Images in /public (hero, og-image, logo, cups). Next serves these
      // with `max-age=0`, so every page view revalidated the 150KB hero.
      // A week rather than `immutable`: these filenames are not hashed, so a
      // replaced file must still be picked up eventually, and
      // stale-while-revalidate keeps that refresh off the critical path.
      // /_next/static is unaffected — Next pins its own immutable header.
      //
      // Deliberately plain patterns. `/:path*/:file.:ext(...)` matched the
      // right files in isolation but broke route matching in `next dev`:
      // every page below /[locale] returned the framework 404. And the
      // commonly copied `/:all*(svg|jpg|png)` also matches paths that merely
      // END in those letters, e.g. a product slug ".../lavazza-png".
      ...[
        "/:file([^/]+\\.(?:svg|jpg|jpeg|png|webp|avif|ico))",
        "/assets/:path*",
        "/images/:path*",
      ].map(source => ({
        source,
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      })),
    ];
  },
};

export default nextConfig;
