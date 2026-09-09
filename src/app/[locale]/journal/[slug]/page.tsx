// Server Component — owns metadata and Article structured data for a journal post.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BlogPostClient from './BlogPostClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { RelatedLinks, type RelatedLink } from '@/components/seo/RelatedLinks';
import { getBlogPost, getBlogPosts, getBrands, probeApiReachable } from '@/lib/api/server';
import { generateArticleSchema, generateBreadcrumbSchema, pageMetadata } from '@/lib/seo';
import { LOCALES, toLocale, type Locale } from '@/lib/i18n';

export const revalidate = 3600;

/** Pre-render every published post in every locale; unknown slugs render on demand. */
export async function generateStaticParams() {
    const posts = await getBlogPosts();
    const slugs = posts.map(p => p.slug).filter((s): s is string => Boolean(s));
    return LOCALES.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

function toPlainText(html?: string | null): string | undefined {
    if (!html) return undefined;
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text || undefined;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale: rawLocale, slug } = await params;
    const locale = toLocale(rawLocale);
    const post = await getBlogPost(slug);

    if (!post) {
        return { title: 'Article introuvable', robots: { index: false, follow: true } };
    }

    const description =
        post.meta_description ?? post.excerpt ?? toPlainText(post.body)?.slice(0, 155) ?? '';

    return pageMetadata({
        locale,
        title: post.meta_title || post.title,
        description,
        path: `/journal/${slug}`,
        image: post.featured_image,
    });
}

/**
 * Builds the "read next" block that turns an article into a route to a
 * commercial page.
 *
 * The journal already carries eight strong commercial-intent pieces
 * ("Grossiste café à Paris…", "Bristot Bean To Cup 1kg…"), but every one of
 * them dead-ended: the only outbound links were "back to journal". An article
 * that ranks and then leads nowhere converts nothing and passes no authority
 * to the pages meant to rank.
 *
 * Links are chosen from what the article is actually about — a brand named in
 * the title gets that brand's page — so this stays a genuine navigational aid
 * rather than a boilerplate link farm repeated identically on 17 URLs.
 */
async function buildArticleLinks(
    locale: Locale,
    post: { title: string; excerpt?: string; category?: string },
): Promise<RelatedLink[]> {
    const haystack = `${post.title} ${post.excerpt ?? ''} ${post.category ?? ''}`.toLowerCase();
    const links: RelatedLink[] = [];

    // Brand mentioned in the article → that brand's catalogue page.
    const brands = await getBrands();
    const named = brands.find(b => b.name && haystack.includes(b.name.toLowerCase()));
    if (named?.slug) {
        links.push({
            href: `/marques/${named.slug}`,
            label: `Café ${named.name}`,
            hint: `Toute la gamme ${named.name} disponible chez Cafrezzo, en grains, moulu ou en capsules.`,
        });
    }

    // Wholesale/professional intent → the B2B hub and the local page.
    const isTradePiece = /grossiste|fournisseur|professionnel|chr|restaurant|h[oô]tel|bureau/.test(
        haystack,
    );
    if (isTradePiece) {
        links.push({
            href: '/professionnels',
            label: 'Grossiste café pour professionnels',
            hint: 'Notre offre pour les cafés, restaurants, hôtels, bureaux et entreprises.',
        });
        links.push({
            href: '/grossiste-cafe-paris',
            label: 'Grossiste café à Paris',
            hint: 'Approvisionnement et service pour les établissements parisiens.',
        });
    }

    if (/machine|expresso|automatique|grains/.test(haystack)) {
        links.push({
            href: '/machine-a-cafe-professionnelle',
            label: 'Machines à café professionnelles',
            hint: 'Machines à grains, à capsules et automatiques pour un usage intensif.',
        });
    }

    // Always give the reader a way into the catalogue itself.
    links.push({
        href: '/shop',
        label: 'Acheter du café en ligne',
        hint: 'Cafés en grains, moulus, capsules et thés — livraison offerte dès 150€.',
    });

    // Four is enough to be useful without turning the article footer into a
    // link dump; de-duplicated because a brand piece can match twice.
    return links.filter((l, i, all) => all.findIndex(x => x.href === l.href) === i).slice(0, 4);
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale: rawLocale, slug } = await params;
    const locale = toLocale(rawLocale);
    const post = await getBlogPost(slug);

    if (!post) {
        // Same reasoning as the product page: only 404 when the API is up and
        // genuinely has no such post, so an outage cannot deindex the journal.
        if (await probeApiReachable()) notFound();
        return <BlogPostClient slug={slug} />;
    }

    const relatedLinks = await buildArticleLinks(locale, post);

    const articleSchema = generateArticleSchema({
        locale,
        title: post.title,
        description: post.meta_description ?? post.excerpt ?? toPlainText(post.body)?.slice(0, 200),
        slug,
        image: post.featured_image,
        author: post.author_name,
        publishedAt: post.published_at,
        updatedAt: post.updated_at,
    });

    const breadcrumbSchema = generateBreadcrumbSchema(locale, [
        { name: 'Accueil', url: '/' },
        { name: 'Journal', url: '/journal' },
        { name: post.title, url: `/journal/${slug}` },
    ]);

    return (
        <>
            <JsonLd schema={[articleSchema, breadcrumbSchema]} />
            {/* initialPost seeds the client so the prose is in the server HTML —
                see the note on BlogPostClient. */}
            <BlogPostClient slug={slug} initialPost={post} />
            <div className="bg-ink">
                <RelatedLinks
                    locale={locale}
                    heading={locale === 'fr' ? 'À lire ensuite' : 'Read next'}
                    links={relatedLinks}
                />
            </div>
        </>
    );
}
