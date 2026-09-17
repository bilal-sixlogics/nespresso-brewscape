// Server Component wrapper for the homepage.
//
// The homepage body is a Client Component (`HomePageClient`) and so cannot
// export metadata itself. This wrapper supplies the canonical URL, hreflang
// alternates and page-level Open Graph data.
import { HomeLinkHub } from '@/components/seo/HomeLinkHub';
import { toLocale } from '@/lib/i18n';

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
            <HomePageClient />
            {/* Server-rendered internal links to the B2B and brand pages.
                Appended after the client body so nothing above it changes. */}
            <HomeLinkHub locale={locale} />
        </>
    );
}
