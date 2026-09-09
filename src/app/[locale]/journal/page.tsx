// Server Component for the journal index.
//
// The listing was previously a Client Component that fetched its own posts and
// rendered a spinner until they arrived, so the server response for
// /fr/journal contained no links to any article. Seventeen published pieces —
// including the eight commercial "grossiste café" articles — were therefore
// orphaned: discoverable in the sitemap, but with no crawlable path from any
// other page on the site.
//
// Now the posts are fetched here and the client hydrates over real markup.
import Link from 'next/link';

import JournalPageClient from './JournalPageClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { getBlogPosts } from '@/lib/api/server';
import { generateBreadcrumbSchema, SITE_URL } from '@/lib/seo';
import { localePath, toLocale, type Locale } from '@/lib/i18n';

export const revalidate = 3600;

// No metadata export: title/description/canonical/hreflang all come from
// ./layout.tsx, which already describes this route. Declaring them again here
// would give the two definitions room to drift.

/**
 * ItemList of the articles actually on the page.
 *
 * Gives an answer engine the list of headlines and their URLs without it
 * having to infer the listing structure from markup.
 */
function buildItemList(locale: Locale, posts: { slug?: string; title: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: posts.slice(0, 25).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.title,
            url: `${SITE_URL}${localePath(locale, `/journal/${p.slug ?? ''}`)}`,
        })),
    };
}

export default async function JournalPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    const posts = await getBlogPosts();
    const published = posts.filter(p => p.slug);

    return (
        <>
            <JsonLd
                schema={[
                    generateBreadcrumbSchema(locale, [
                        { name: 'Accueil', url: '/' },
                        { name: 'Journal', url: '/journal' },
                    ]),
                    ...(published.length ? [buildItemList(locale, published)] : []),
                ]}
            />
            <JournalPageClient initialPosts={published} />

            {/* Complete archive list, server-rendered.
                The grid above paginates six at a time on the client, so only
                the first page of articles reaches the initial HTML — the rest
                are behind a "load more" button and invisible to a crawler that
                does not click it. This lists every published article as a
                plain <a>, so each one is a single hop from /journal rather
                than reachable only via the sitemap. */}
            {published.length > 0 && (
                <section className="bg-ink px-4 sm:px-8 pb-16">
                    <div className="max-w-[1000px] mx-auto border-t border-sand/15 pt-12">
                        <h2 className="font-display text-2xl uppercase tracking-tight text-sand mb-8">
                            {locale === 'fr' ? 'Tous les articles' : 'All articles'}
                        </h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            {published.map(post => (
                                <li key={post.slug}>
                                    <Link
                                        href={localePath(locale, `/journal/${post.slug}`)}
                                        className="text-sand/70 text-sm hover:text-gold transition-colors leading-relaxed"
                                    >
                                        {post.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* The journal is the site's main entry point from informational
                queries; these give that traffic somewhere commercial to go. */}
            <div className="bg-ink">
                <RelatedLinks
                    locale={locale}
                    heading={locale === 'fr' ? 'Nos offres' : 'Our offering'}
                    links={
                        locale === 'fr'
                            ? [
                                  {
                                      href: '/professionnels',
                                      label: 'Grossiste café pour professionnels',
                                      hint: 'Café et machines pour les cafés, restaurants, hôtels, bureaux et entreprises.',
                                  },
                                  {
                                      href: '/machine-a-cafe-professionnelle',
                                      label: 'Machines à café professionnelles',
                                      hint: 'Machines à grains, à capsules et automatiques pour un usage intensif.',
                                  },
                                  {
                                      href: '/marques',
                                      label: 'Marques de café distribuées',
                                      hint: 'Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo et plus.',
                                  },
                                  {
                                      href: '/shop',
                                      label: 'Acheter du café en ligne',
                                      hint: 'Cafés en grains, moulus, capsules et thés.',
                                  },
                              ]
                            : [
                                  {
                                      href: '/professionnels',
                                      label: 'Coffee wholesale for businesses',
                                      hint: 'Coffee and machines for cafés, restaurants, hotels and offices.',
                                  },
                                  {
                                      href: '/marques',
                                      label: 'Coffee brands we distribute',
                                      hint: 'Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo and more.',
                                  },
                                  {
                                      href: '/shop',
                                      label: 'Buy coffee online',
                                      hint: 'Beans, ground coffee, capsules and teas.',
                                  },
                              ]
                    }
                />
            </div>
        </>
    );
}
