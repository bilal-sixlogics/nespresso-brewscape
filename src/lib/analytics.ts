/**
 * Google Analytics 4 configuration.
 *
 * The measurement ID was previously hardcoded in `app/layout.tsx`. It lives
 * here so there is one place to change it and so staging can point at a
 * different property via NEXT_PUBLIC_GA_MEASUREMENT_ID.
 *
 * The fallback is the ID currently live on cafrezzo.com: without it, a deploy
 * that forgets the env var would silently stop all analytics collection.
 * A GA measurement ID is not a secret — it is visible in the page source of
 * every site that uses one.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CONSENT — UNRESOLVED
 *
 * This site currently loads GA on every page view with no prior consent, and
 * there is no cookie banner. Cafrezzo is established in France and ships to
 * FR/BE/LU, so GDPR + ePrivacy apply and analytics cookies require opt-in
 * BEFORE the tag loads. The privacy policy
 * (`legalPrivacySection5Content`) tells users to manage cookies via their
 * browser settings, which is not a valid consent mechanism under those rules.
 *
 * Resolving this needs a consent banner plus Google Consent Mode v2 defaults
 * (`analytics_storage: 'denied'` until granted). Both are product/legal
 * decisions, not purely technical ones, so nothing here gates the tag yet.
 * Do not add further tracking until this is settled.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const GA_MEASUREMENT_ID =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-MNS5LYCQ5H';

/**
 * Whether the GA tag should be rendered at all.
 *
 * Excludes development so local browsing does not pollute production
 * reporting — the previous setup sent every `npm run dev` page view to the
 * live property.
 */
export function isAnalyticsEnabled(): boolean {
    return process.env.NODE_ENV === 'production' && Boolean(GA_MEASUREMENT_ID);
}
