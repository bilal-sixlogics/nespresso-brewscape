// Server Component wrapper for the homepage.
//
// The homepage body is a Client Component (`HomePageClient`) and so cannot
// export metadata itself. This wrapper supplies the canonical URL, hreflang
// alternates and page-level Open Graph data. It renders no markup of its own —
// the visible output is unchanged.
import HomePageClient from './HomePageClient';

// The locale layout's own metadata already describes the homepage (canonical,
// hreflang, og) for each locale, so there is deliberately no generateMetadata
// here — duplicating it would only risk the two drifting apart.

export default function Page() {
    return <HomePageClient />;
}
