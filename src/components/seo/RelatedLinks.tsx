import Link from 'next/link';

import { localePath, type Locale } from '@/lib/i18n';

export interface RelatedLink {
    /** Locale-free path, e.g. '/professionnels'. */
    href: string;
    /**
     * Descriptive anchor text. Must describe the destination — "grossiste café
     * pour professionnels", not "en savoir plus". Anchor text is one of the few
     * on-page signals that tells Google what the *target* page is about, so a
     * generic anchor spends a link and passes no topic with it.
     */
    label: string;
    /** Optional one-line gloss shown under the anchor. */
    hint?: string;
}

/**
 * A server-rendered block of internal links.
 *
 * Server component on purpose. The site's `LocaleLink` is a client component
 * (it reads `usePathname()` to prefix the locale), so anything linking through
 * it only exists after hydration. That is why the journal index server-rendered
 * zero links to its own articles. These are real `<a href>`s in the initial
 * HTML, which is the only form a non-JS crawler can follow.
 */
export function RelatedLinks({
    locale,
    heading,
    links,
    className = '',
}: {
    locale: Locale;
    heading: string;
    links: RelatedLink[];
    className?: string;
}) {
    if (!links.length) return null;

    return (
        <nav aria-labelledby="related-links-heading" className={`max-w-[1000px] mx-auto px-4 lg:px-8 pb-24 ${className}`}>
            <h2
                id="related-links-heading"
                className="font-display text-2xl uppercase tracking-tight text-sand mb-8"
            >
                {heading}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {links.map(link => (
                    <li key={link.href}>
                        <Link
                            href={localePath(locale, link.href)}
                            className="block rounded-2xl border border-sand/15 p-5 hover:border-gold transition-colors"
                        >
                            <span className="block text-sm font-bold uppercase tracking-widest text-gold">
                                {link.label}
                            </span>
                            {link.hint && (
                                <span className="block mt-2 text-sm text-sand/60 leading-relaxed">
                                    {link.hint}
                                </span>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
