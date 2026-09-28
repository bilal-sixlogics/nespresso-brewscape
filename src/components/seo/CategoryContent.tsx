import Link from 'next/link';

import { localePath, type Locale } from '@/lib/i18n';

/**
 * Supporting editorial block for a catalogue listing page.
 *
 * Exists because the listing pages were essentially a hero plus a product
 * grid: /fr/machines carried around 100 words of its own, which is thin for a
 * page expected to compete on "machine à café professionnelle". This adds the
 * commercial context a category page needs — what the range covers, how to
 * choose within it, who it is for — without touching the grid above it.
 *
 * Shared rather than written per page for two reasons: the heading hierarchy
 * is enforced in one place (the block opens at <h2>, sub-points are <h3>,
 * never skipping a level), and a fix here reaches every listing at once. The
 * *content* is always passed in by the page, so no two listings share copy.
 *
 * Server component: the prose must be in the initial HTML, which is the whole
 * point of adding it.
 */

export interface CategoryBlock {
    /** Renders as <h3> beneath the section's <h2>. */
    heading: string;
    body: string;
}

export interface CategoryContentProps {
    locale: Locale;
    /** Opens the block. Always an <h2>, sitting under the page's single <h1>. */
    heading: string;
    /** Lead paragraphs, before any sub-headings. */
    intro: string[];
    /** Optional sub-sections, each an <h3>. */
    blocks?: CategoryBlock[];
    /** Descriptive internal links closing the block. */
    links?: { href: string; label: string }[];
}

export function CategoryContent({
    locale,
    heading,
    intro,
    blocks = [],
    links = [],
}: CategoryContentProps) {
    return (
        <section className="bg-ink text-sand px-4 sm:px-8 py-16 border-t border-sand/10">
            <div className="max-w-[900px] mx-auto">
                <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-tight mb-6">
                    {heading}
                </h2>

                <div className="space-y-5">
                    {intro.map(p => (
                        <p key={p.slice(0, 40)} className="text-sand/70 leading-relaxed">
                            {p}
                        </p>
                    ))}
                </div>

                {blocks.length > 0 && (
                    <div className="mt-10 space-y-8">
                        {blocks.map(block => (
                            <div key={block.heading}>
                                <h3 className="font-display text-lg uppercase tracking-tight text-sand mb-2">
                                    {block.heading}
                                </h3>
                                <p className="text-sand/70 leading-relaxed">{block.body}</p>
                            </div>
                        ))}
                    </div>
                )}

                {links.length > 0 && (
                    <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
                        {links.map(link => (
                            <Link
                                key={link.href}
                                href={localePath(locale, link.href)}
                                className="text-gold font-bold text-xs uppercase tracking-widest hover:underline"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
