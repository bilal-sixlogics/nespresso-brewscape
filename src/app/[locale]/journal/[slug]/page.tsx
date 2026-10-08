// Server Component — owns metadata and Article structured data for a journal post.
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';

import BlogPostClient from './BlogPostClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { RelatedLinks, type RelatedLink } from '@/components/seo/RelatedLinks';
import { getBlogPost, getBlogPosts, getBrands, probeApiReachable, type BlogPost } from '@/lib/api/server';
import { articleLocale, cleanArticleHtml, cleanArticleText, isThinArticle } from '@/lib/article-content';
import { displayAuthor, journalPath, journalSeo } from '@/lib/journal-seo';
import { generateArticleSchema, generateBreadcrumbSchema, pageMetadata } from '@/lib/seo';
import {
    cmsJournalSlug,
    isAliasedCmsJournalSlug,
    isConsolidatedJournalSlug,
    journalRedirectTarget,
    publicJournalSlug,
} from '@/lib/seo-redirects';
import { localePath, toLocale, type Locale } from '@/lib/i18n';

// Ten minutes rather than an hour: a newly published article should reach the
// journal and its siblings' "read next" blocks the same morning, not after two
// stacked hourly caches.
export const revalidate = 600;

/**
 * Pre-render each published post once, in the language it is written in.
 *
 * This used to emit every post in all five locales. Articles are not
 * translated, so four of the five were copies of the same text — see
 * articleLocale() in lib/article-content.ts.
 */
export async function generateStaticParams() {
    const posts = await getBlogPosts();
    return posts
        .filter(p => p.slug && !isConsolidatedJournalSlug(p.slug))
        .map(p => ({ locale: articleLocale(p), slug: publicJournalSlug(p.slug as string) }));
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
    const post = await getBlogPost(cmsJournalSlug(slug));

    if (!post) {
        return { title: 'Article introuvable', robots: { index: false, follow: true } };
    }

    // The page redirects in this case; metadata for the wrong-language URL is
    // never served, so there is nothing to describe.
    const lang = articleLocale(post);
    if (lang !== locale) return {};

    const seo = journalSeo(post);
    const description = cleanArticleText(
        seo.metaDescription ?? toPlainText(post.body)?.slice(0, 155) ?? '',
    );

    return pageMetadata({
        locale: lang,
        // Published in one language only, so hreflang names just this URL.
        locales: [lang],
        title: seo.metaTitle,
        description,
        path: `/journal/${publicJournalSlug(post.slug ?? slug)}`,
        image: post.featured_image,
        noindex: isThinArticle(post),
        article: {
            publishedTime: post.published_at,
            modifiedTime: post.updated_at,
            author: displayAuthor(post.author_name),
        },
    });
}

/** Lower-cased words of four letters or more, for topical overlap. */
function topicWords(text: string): Set<string> {
    return new Set(
        text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .split(/[^a-z0-9]+/)
            .filter(w => w.length >= 4),
    );
}

/**
 * Up to two other articles on the same subject, in the same language.
 *
 * The trade guides (restaurant, coffee shop, office, cost per cup, machine
 * budget) each ended in links to commercial pages only, so none of them linked
 * to another — a cluster with no internal edges.
 */
function siblingArticles(post: BlogPost, all: BlogPost[], lang: Locale): RelatedLink[] {
    const mine = topicWords(`${post.title} ${post.excerpt ?? ''}`);
    return all
        .filter(p => p.slug && p.slug !== post.slug && !isConsolidatedJournalSlug(p.slug))
        .filter(p => articleLocale(p) === lang)
        .map(p => {
            const words = topicWords(`${p.title} ${p.excerpt ?? ''}`);
            let shared = 0;
            for (const w of words) if (mine.has(w)) shared++;
            return { post: p, shared };
        })
        .filter(c => c.shared >= 3)
        .sort((a, b) => b.shared - a.shared)
        .slice(0, 2)
        .map(({ post: p }) => ({
            href: `/journal/${publicJournalSlug(p.slug as string)}`,
            label: journalSeo(p).headline,
            hint: cleanArticleText(p.excerpt ?? undefined),
        }));
}

/**
 * Builds the "read next" block that turns an article into a route to a
 * commercial page.
 *
 * Links are chosen from what the article is actually about — a brand named in
 * the title gets that brand's page — so this stays a genuine navigational aid
 * rather than a boilerplate link farm repeated identically on every URL.
 */
async function buildArticleLinks(lang: Locale, post: BlogPost): Promise<RelatedLink[]> {
    const fr = lang === 'fr';
    const haystack = `${post.title} ${post.excerpt ?? ''} ${post.category ?? ''}`.toLowerCase();
    const links: RelatedLink[] = [];

    const [brands, posts] = await Promise.all([getBrands(), getBlogPosts()]);

    links.push(...siblingArticles(post, posts, lang));

    // Brand mentioned in the article → that brand's catalogue page.
    const named = brands.find(b => b.name && haystack.includes(b.name.toLowerCase()));
    if (named?.slug) {
        links.push({
            href: `/marques/${named.slug}`,
            label: fr ? `Café ${named.name}` : `${named.name} coffee`,
            hint: fr
                ? `Toute la gamme ${named.name} disponible chez Cafrezzo, en grains, moulu ou en capsules.`
                : `The full ${named.name} range at Cafrezzo: beans, ground and capsules.`,
        });
    }

    // Wholesale/professional intent → the B2B hub and the local page.
    const isTradePiece = /grossiste|fournisseur|professionnel|chr|restaurant|h[oô]tel|bureau|wholesale|supplier|business/.test(
        haystack,
    );
    if (isTradePiece) {
        links.push({
            href: '/professionnels',
            label: fr ? 'Grossiste café pour professionnels' : 'Coffee wholesale for businesses',
            hint: fr
                ? 'Notre offre pour les cafés, restaurants, hôtels, bureaux et entreprises.'
                : 'Coffee and machines for cafés, restaurants, hotels and offices.',
        });
        links.push({
            href: '/grossiste-cafe-paris',
            label: 'Grossiste café à Paris',
            hint: fr
                ? 'Approvisionnement et service pour les établissements parisiens.'
                : 'Supply and service for Paris businesses (in French).',
        });
    }

    if (/machine|expresso|automatique|grains/.test(haystack)) {
        links.push({
            href: '/machine-a-cafe-professionnelle',
            label: 'Machines à café professionnelles',
            hint: fr
                ? 'Machines à grains, à capsules et automatiques pour un usage intensif.'
                : 'Bean-to-cup, capsule and automatic machines (in French).',
        });
    }

    // Always give the reader a way into the catalogue itself.
    links.push({
        href: '/shop',
        label: fr ? 'Acheter du café en ligne' : 'Buy coffee online',
        hint: fr
            ? 'Cafés en grains, moulus, capsules et thés — livraison offerte dès 150€.'
            : 'Beans, ground coffee, capsules and teas — free delivery over €150.',
    });

    // Six: two sibling articles plus up to four commercial pages. De-duplicated
    // because a brand piece can match twice.
    return links.filter((l, i, all) => all.findIndex(x => x.href === l.href) === i).slice(0, 6);
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale: rawLocale, slug } = await params;
    const locale = toLocale(rawLocale);

    // Consolidated into a commercial page — see lib/seo-redirects.ts for why.
    // Checked before the fetch: the article still exists in the CMS, we simply
    // no longer serve it at its own URL, so there is nothing to look up.
    // permanentRedirect throws a control-flow signal; nothing after it runs.
    const consolidated = journalRedirectTarget(slug);
    if (consolidated) permanentRedirect(localePath(locale, consolidated));

    const post = await getBlogPost(cmsJournalSlug(slug));

    if (!post) {
        // Same reasoning as the product page: only 404 when the API is up and
        // genuinely has no such post, so an outage cannot deindex the journal.
        if (await probeApiReachable()) notFound();
        return <BlogPostClient slug={cmsJournalSlug(slug)} />;
    }

    // One URL per article: its own language and its public slug. An old CMS
    // slug, or the right slug under another locale, goes there in one hop.
    const lang = articleLocale(post);
    if (lang !== locale || isAliasedCmsJournalSlug(slug)) {
        permanentRedirect(journalPath(post));
    }

    const publicSlug = publicJournalSlug(post.slug ?? slug);
    const seo = journalSeo(post);
    const body = post.body ? cleanArticleHtml(post.body, { title: seo.headline, locale: lang }) : post.body;
    const cleaned: BlogPost = {
        ...post,
        title: seo.headline,
        body,
        excerpt: cleanArticleText(post.excerpt),
        author_name: displayAuthor(post.author_name),
    };

    const relatedLinks = await buildArticleLinks(lang, post);

    const articleSchema = generateArticleSchema({
        locale: lang,
        title: seo.headline,
        description: cleanArticleText(seo.metaDescription ?? toPlainText(body)?.slice(0, 200)),
        slug: publicSlug,
        image: post.featured_image,
        author: cleaned.author_name,
        publishedAt: post.published_at,
        updatedAt: post.updated_at,
        wordCount: toPlainText(body)?.split(' ').length,
    });

    const breadcrumbSchema = generateBreadcrumbSchema(lang, [
        { name: lang === 'fr' ? 'Accueil' : 'Home', url: '/' },
        { name: 'Journal', url: '/journal' },
        { name: seo.headline, url: `/journal/${publicSlug}` },
    ]);

    return (
        <>
            <JsonLd schema={[articleSchema, breadcrumbSchema]} />
            {/* initialPost seeds the client so the prose is in the server HTML —
                see the note on BlogPostClient. */}
            <BlogPostClient slug={post.slug ?? slug} initialPost={cleaned} />
            <div className="bg-ink">
                <RelatedLinks
                    locale={lang}
                    heading={lang === 'fr' ? 'À lire ensuite' : 'Read next'}
                    links={relatedLinks}
                />
            </div>
        </>
    );
}
