import { MetadataRoute } from 'next';
import { AppConfig } from '@/lib/config';
import { Endpoints } from '@/lib/api/endpoints';
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePath } from '@/lib/i18n';

// Rebuilt hourly so newly published products appear without a redeploy.
// (Previously `force-static` over a hardcoded mock array, which meant the
// sitemap never reflected the real catalogue.)
export const revalidate = 3600;

const BASE_URL = `https://${AppConfig.brand.domain}`;

// The catalogue is ~104 products; one page covers it with headroom.
const CATALOGUE_PAGE_SIZE = 200;

interface ApiProduct {
    slug?: string;
    status?: string;
    updated_at?: string;
}

interface ApiCategory {
    slug?: string;
    storefront_page?: string;
}

interface ApiBlogPost {
    id?: number | string;
    status?: string;
    updated_at?: string;
    published_at?: string;
}

/**
 * Fetches a collection endpoint, tolerating both `{data: [...]}` and bare
 * arrays. Never throws: a sitemap that omits product URLs is recoverable,
 * a build that crashes on a flaky API is not.
 */
async function fetchCollection<T>(url: string, label: string): Promise<T[]> {
    try {
        const res = await fetch(url, {
            headers: { Accept: 'application/json' },
            next: { revalidate },
        });
        if (!res.ok) {
            console.error(`[sitemap] ${label} responded ${res.status}; omitting from sitemap`);
            return [];
        }
        const body = await res.json();
        const items = Array.isArray(body) ? body : body?.data;
        return Array.isArray(items) ? (items as T[]) : [];
    } catch (err) {
        console.error(`[sitemap] ${label} fetch failed; omitting from sitemap:`, err);
        return [];
    }
}

// Only emit lastmod when the API gave us a date we can actually parse —
// an Invalid Date serialises to a malformed <lastmod> and invalidates the XML.
function parseDate(value?: string): Date | undefined {
    if (!value) return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * hreflang alternates for one locale-free path.
 *
 * Google treats sitemap-level hreflang as equivalent to the on-page link tags,
 * and having both is the recommended belt-and-braces: it tells the crawler the
 * five URLs are translations rather than duplicates before it fetches any.
 */
function hreflangFor(path: string): Record<string, string> {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) {
        languages[LOCALE_META[locale].hreflang] = `${BASE_URL}${localePath(locale, path)}`;
    }
    languages['x-default'] = `${BASE_URL}${localePath(DEFAULT_LOCALE, path)}`;
    return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // Locale-free paths with their crawl hints. Expanded across every locale
    // below, so a new locale needs no change here.
    const STATIC_PATHS: Array<{
        path: string;
        changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
        priority: number;
    }> = [
        { path: '/',             changeFrequency: 'daily',   priority: 1.0 },
        { path: '/shop',         changeFrequency: 'daily',   priority: 0.9 },
        { path: '/machines',     changeFrequency: 'weekly',  priority: 0.8 },
        { path: '/accessories',  changeFrequency: 'weekly',  priority: 0.8 },
        { path: '/sweets',       changeFrequency: 'weekly',  priority: 0.8 },
        { path: '/blog',         changeFrequency: 'weekly',  priority: 0.7 },
        { path: '/our-origins',  changeFrequency: 'monthly', priority: 0.6 },
        { path: '/contact',      changeFrequency: 'monthly', priority: 0.6 },
        { path: '/visit-shop',   changeFrequency: 'monthly', priority: 0.6 },
        { path: '/wholesale',    changeFrequency: 'monthly', priority: 0.5 },
        { path: '/faq',          changeFrequency: 'monthly', priority: 0.5 },
        { path: '/shipping',     changeFrequency: 'monthly', priority: 0.4 },
        { path: '/returns',      changeFrequency: 'monthly', priority: 0.4 },
        { path: '/terms',        changeFrequency: 'yearly',  priority: 0.3 },
        { path: '/privacy',      changeFrequency: 'yearly',  priority: 0.3 },
    ];

    const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.flatMap(entry =>
        LOCALES.map(locale => ({
            url: `${BASE_URL}${localePath(locale, entry.path)}`,
            lastModified: now,
            changeFrequency: entry.changeFrequency,
            priority: locale === DEFAULT_LOCALE ? entry.priority : entry.priority * 0.9,
            alternates: { languages: hreflangFor(entry.path) },
        })),
    );

    const [products, categories, posts, brewGuides] = await Promise.all([
        fetchCollection<ApiProduct>(
            `${Endpoints.products}?per_page=${CATALOGUE_PAGE_SIZE}`,
            'products',
        ),
        fetchCollection<ApiCategory>(Endpoints.categories, 'categories'),
        fetchCollection<ApiBlogPost>(Endpoints.blogPosts, 'blog posts'),
        fetchCollection<unknown>(Endpoints.brewGuides, 'brew guides'),
    ]);

    // /brew-guide renders entirely from the brew-guides API. That endpoint is
    // currently returning HTTP 500, so the page serves an empty <main> — and
    // submitting an empty page for indexing invites a thin-content assessment.
    // Include it only once the API actually returns guides, so the entry
    // reappears on its own when the backend is fixed. No redeploy needed.
    const brewGuideRoutes: MetadataRoute.Sitemap = brewGuides.length
        ? LOCALES.map(locale => ({
              url: `${BASE_URL}${localePath(locale, '/brew-guide')}`,
              lastModified: now,
              changeFrequency: 'monthly' as const,
              priority: locale === DEFAULT_LOCALE ? 0.6 : 0.54,
              alternates: { languages: hreflangFor('/brew-guide') },
          }))
        : [];

    if (!brewGuides.length) {
        console.warn('[sitemap] brew-guides returned nothing — omitting /brew-guide');
    }

    const productRoutes: MetadataRoute.Sitemap = products
        .filter(p => p.slug && p.status !== 'inactive' && p.status !== 'draft')
        .flatMap(p =>
            LOCALES.map(locale => ({
                url: `${BASE_URL}${localePath(locale, `/shop/${p.slug}`)}`,
                lastModified: parseDate(p.updated_at) ?? now,
                changeFrequency: 'weekly' as const,
                priority: locale === DEFAULT_LOCALE ? 0.85 : 0.76,
                alternates: { languages: hreflangFor(`/shop/${p.slug}`) },
            })),
        );

    // Category listings (?category=<slug>) are deliberately NOT listed.
    //
    // They were, briefly, but the listing pages canonicalise to their bare path
    // (/shop, /machines, ...), so submitting `/shop?category=x` told Google to
    // index a URL that simultaneously declares itself a copy of /shop. Google
    // honours the canonical and ignores the sitemap entry, so the entries were
    // contradictory noise.
    //
    // To make them genuinely indexable they need their own canonical, title and
    // description, which means reading `searchParams` in a server component —
    // the same refactor /shop needs to be server-rendered at all. Add them back
    // as part of that work, not before.
    void categories;

    const blogRoutes: MetadataRoute.Sitemap = posts
        .filter(p => p.id != null && p.status !== 'draft')
        .flatMap(p =>
            LOCALES.map(locale => ({
                url: `${BASE_URL}${localePath(locale, `/blog/${p.id}`)}`,
                lastModified: parseDate(p.updated_at) ?? parseDate(p.published_at) ?? now,
                changeFrequency: 'monthly' as const,
                priority: locale === DEFAULT_LOCALE ? 0.6 : 0.54,
                alternates: { languages: hreflangFor(`/blog/${p.id}`) },
            })),
        );

    // Guard against a duplicate URL slipping in from any source.
    const all = [
        ...staticRoutes,
        ...brewGuideRoutes,
        ...productRoutes,
        ...blogRoutes,
    ];
    const seen = new Set<string>();
    return all.filter(entry => {
        if (seen.has(entry.url)) return false;
        seen.add(entry.url);
        return true;
    });
}
