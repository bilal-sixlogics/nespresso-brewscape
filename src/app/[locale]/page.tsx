// Server Component wrapper for the homepage.
//
// The homepage body is a Client Component (`HomePageClient`) and so cannot
// export metadata itself. This wrapper supplies the canonical URL, hreflang
// alternates and page-level Open Graph data.
import { HomeLinkHub } from '@/components/seo/HomeLinkHub';
import { JsonLd } from '@/components/seo/JsonLd';
import { storeSchema } from '@/lib/seo';
import { DEFAULT_LOCALE, toLocale } from '@/lib/i18n';

import HomePageClient from './HomePageClient';

// The locale layout's own metadata already describes the homepage (canonical,
// hreflang, og) for each locale, so there is deliberately no generateMetadata
// here — duplicating it would only risk the two drifting apart.

// The link hub calls the brands endpoint. Revalidated rather than rebuilt per
// request so the homepage stays static-ish; an hour matches the sitemap.
export const revalidate = 3600;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const locale = toLocale((await params).locale);

    return (
        <>
            {/* The physical-location node, on the site's highest-authority URL.
                It was only on /contact, /professionnels and /visit-shop, so the
                most-crawled page in the domain said nothing about the shop
                being a real place in Gonesse. Same `@id` as those pages, so
                this consolidates onto one entity rather than creating a second.

                French only: the locale layout already emits Organization and
                WebSite everywhere, and a local-intent node belongs on the
                locale that serves the local market. */}
            {locale === DEFAULT_LOCALE && <JsonLd schema={storeSchema} />}
            <HomePageClient />
            {/* Server-rendered internal links to the B2B and brand pages.
                Appended after the client body so nothing above it changes. */}
            <HomeLinkHub locale={locale} />
        </>
    );
}
