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
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.cafrezzo.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.stripe.com",
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
    ];
  },
};

export default nextConfig;
