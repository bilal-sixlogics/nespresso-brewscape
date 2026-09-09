import { MetadataRoute } from 'next';
import { Endpoints } from '@/lib/api/endpoints';
import { FRENCH_ONLY, FR_EN, SITE_URL } from '@/lib/seo';
import {
    DEFAULT_LOCALE,
    LOCALES,
    LOCALE_META,
    localePath,
    type Locale,
} from '@/lib/i18n';

// Rebuilt hourly so newly published products appear without a redeploy.
// (Previously `force-static` over a hardcoded mock array, which meant the
// sitemap never reflected the real catalogue.)
export const revalidate = 3600;

// The catalogue is ~104 products, so in practice one request covers it. It is
// still paged through below: a single fixed-size request would quietly drop
// everything past the first page the day the catalogue outgrows it.
const CATALOGUE_PAGE_SIZE = 200;

// Backstop for an API that ignores `page` and keeps answering with full pages.
// Without it that case loops until the request budget dies.
const MAX_CATALOGUE_PAGES = 25;

interface ApiProduct {
    slug?: string;
    status?: string;
    updated_at?: string;
}

interface ApiCategory {
    slug?: string;
    storefront_page?: string;
}

interface ApiBrand {
    slug?: string;
    status?: string;
}

interface ApiBlogPost {
    id?: number | string;
    slug?: string;
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
 * Every published product, paged through instead of capped at one request.
 *
 * Stops as soon as a page comes back short. That is also what happens when the
 * API ignores `page` altogether — it repeats the same short page, so we exit
 * after a single round trip. If a *full* page still arrives on the last allowed
 * iteration the catalogue has outgrown the backstop and the sitemap really is
 * incomplete, so that says so loudly rather than truncating in silence.
 */
async function fetchAllProducts(): Promise<ApiProduct[]> {
    const all: ApiProduct[] = [];

    for (let page = 1; page <= MAX_CATALOGUE_PAGES; page++) {
        const batch = await fetchCollection<ApiProduct>(
            `${Endpoints.products}?per_page=${CATALOGUE_PAGE_SIZE}&page=${page}`,
            `products page ${page}`,
        );
        all.push(...batch);
        if (batch.length < CATALOGUE_PAGE_SIZE) return all;
    }

    console.error(
        `[sitemap] products still returning full pages after ${MAX_CATALOGUE_PAGES} requests ` +
            `(${all.length} collected) — the sitemap is TRUNCATED; raise MAX_CATALOGUE_PAGES`,
    );
    return all;
}

/**
 * hreflang alternates for one locale-free path.
 *
 * Google treats sitemap-level hreflang as equivalent to the on-page link tags,
 * and having both is the recommended belt-and-braces: it tells the crawler the
 * five URLs are translations rather than duplicates before it fetches any.
 */
function hreflangFor(
    path: string,
    // Must match the `locales` passed to pageMetadata() for the same route.
    // A sitemap alternate for a locale the page 404s in contradicts the page's
    // own link tags, and Google resolves that by trusting neither.
    locales: readonly Locale[] = LOCALES,
): Record<string, string> {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
        languages[LOCALE_META[locale].hreflang] = `${SITE_URL}${localePath(locale, path)}`;
    }
    const primary = locales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : locales[0];
    languages['x-default'] = `${SITE_URL}${localePath(primary, path)}`;
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
        { path: '/journal',      changeFrequency: 'weekly',  priority: 0.7 },
        { path: '/our-origins',  changeFrequency: 'monthly', priority: 0.6 },
        { path: '/contact',      changeFrequency: 'monthly', priority: 0.6 },
        { path: '/visit-shop',   changeFrequency: 'monthly', priority: 0.6 },
        { path: '/faq',          changeFrequency: 'monthly', priority: 0.5 },
        { path: '/shipping',     changeFrequency: 'monthly', priority: 0.4 },
        { path: '/returns',      changeFrequency: 'monthly', priority: 0.4 },
        { path: '/terms',        changeFrequency: 'yearly',  priority: 0.3 },
        { path: '/privacy',      changeFrequency: 'yearly',  priority: 0.3 },
        // /wholesale is deliberately absent: it now 308s to /professionnels,
        // and listing a redirect in a sitemap asks Google to index a URL that
        // immediately tells it to go somewhere else.
    ];

    const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.flatMap(entry =>
        LOCALES.map(locale => ({
            url: `${SITE_URL}${localePath(locale, entry.path)}`,
            lastModified: now,
            changeFrequency: entry.changeFrequency,
            priority: locale === DEFAULT_LOCALE ? entry.priority : entry.priority * 0.9,
            alternates: { languages: hreflangFor(entry.path) },
        })),
    );

    /**
     * The commercial landing pages, which are not published in all five
     * languages — so they are expanded over their own locale set rather than
     * over LOCALES.
     *
     * Priorities are high on purpose: /professionnels is the page the whole
     * "grossiste café" cluster is meant to funnel into, and it should be
     * crawled at least as often as the shop.
     */
    const LANDING_PATHS: Array<{
        path: string;
        locales: readonly Locale[];
        priority: number;
    }> = [
        { path: '/professionnels',               locales: FR_EN,       priority: 0.95 },
        { path: '/grossiste-cafe-paris',         locales: FRENCH_ONLY, priority: 0.9 },
        { path: '/grossiste-cafe-ile-de-france', locales: FRENCH_ONLY, priority: 0.9 },
        { path: '/grossiste-machines-a-cafe',    locales: FRENCH_ONLY, priority: 0.85 },
        { path: '/machine-a-cafe-professionnelle', locales: FRENCH_ONLY, priority: 0.85 },
        { path: '/marques',                      locales: FR_EN,       priority: 0.8 },
    ];

    const landingRoutes: MetadataRoute.Sitemap = LANDING_PATHS.flatMap(entry =>
        entry.locales.map(locale => ({
            url: `${SITE_URL}${localePath(locale, entry.path)}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: locale === DEFAULT_LOCALE ? entry.priority : entry.priority * 0.9,
            alternates: { languages: hreflangFor(entry.path, entry.locales) },
        })),
    );

    const [products, categories, posts, brewGuides, brands] = await Promise.all([
        fetchAllProducts(),
        fetchCollection<ApiCategory>(Endpoints.categories, 'categories'),
        // per_page is explicit: the blog endpoint defaults to 12 and there are
        // already 17 posts, so an unparameterised request left five published
        // articles out of the sitemap altogether.
        fetchCollection<ApiBlogPost>(`${Endpoints.blogPosts}?per_page=200`, 'blog posts'),
        fetchCollection<unknown>(Endpoints.brewGuides, 'brew guides'),
        fetchCollection<ApiBrand>(Endpoints.brands, 'brands'),
    ]);

    // One page per distributed brand — the targets for "café Lavazza",
    // "café Delta", "café Bristot" and so on. Published in fr and en only,
    // matching the pages themselves.
    const brandRoutes: MetadataRoute.Sitemap = brands
        .filter(b => b.slug && b.status !== 'inactive')
        .flatMap(b =>
            FR_EN.map(locale => ({
                url: `${SITE_URL}${localePath(locale, `/marques/${b.slug}`)}`,
                lastModified: now,
                changeFrequency: 'weekly' as const,
                priority: locale === DEFAULT_LOCALE ? 0.8 : 0.72,
                alternates: { languages: hreflangFor(`/marques/${b.slug}`, FR_EN) },
            })),
        );

    // /brew-guide renders entirely from the brew-guides API. That endpoint is
    // currently returning HTTP 500, so the page serves an empty <main> — and
    // submitting an empty page for indexing invites a thin-content assessment.
    // Include it only once the API actually returns guides, so the entry
    // reappears on its own when the backend is fixed. No redeploy needed.
    const brewGuideRoutes: MetadataRoute.Sitemap = brewGuides.length
        ? LOCALES.map(locale => ({
              url: `${SITE_URL}${localePath(locale, '/brew-guide')}`,
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
                url: `${SITE_URL}${localePath(locale, `/shop/${p.slug}`)}`,
                lastModified: parseDate(p.updated_at) ?? now,
                changeFrequency: 'weekly' as const,
                priority: locale === DEFAULT_LOCALE ? 0.85 : 0.76,
                alternates: { languages: hreflangFor(`/shop/${p.slug}`) },
            })),
        );

    /**
     * Category listings (/shop?category=<slug>).
     *
     * These are back in the sitemap. They were removed because /shop
     * canonicalised every filtered view to its bare path, so submitting
     * `?category=x` asked Google to index a URL that declared itself a copy of
     * /shop — contradictory noise. The condition attached to restoring them
     * was that /shop become a Server Component able to describe each filter
     * with its own title, description and self-canonical. It now is, and
     * generateMetadata() does exactly that, so the entries are no longer in
     * conflict with the pages they point at.
     *
     * Only categories whose products live on /shop are listed: a category
     * routed to /machines is reached through that page instead, and listing it
     * under /shop would publish a second URL for the same set of products.
     */
    const categoryRoutes: MetadataRoute.Sitemap = categories
        .filter(c => c.slug && (c.storefront_page ?? '/shop') === '/shop')
        .flatMap(c =>
            LOCALES.map(locale => ({
                url: `${SITE_URL}${localePath(locale, `/shop?category=${c.slug}`)}`,
                lastModified: now,
                changeFrequency: 'weekly' as const,
                priority: locale === DEFAULT_LOCALE ? 0.75 : 0.68,
                alternates: {
                    languages: hreflangFor(`/shop?category=${c.slug}`),
                },
            })),
        );

    const blogRoutes: MetadataRoute.Sitemap = posts
        .filter(p => p.slug && p.status !== 'draft')
        .flatMap(p =>
            LOCALES.map(locale => ({
                url: `${SITE_URL}${localePath(locale, `/journal/${p.slug}`)}`,
                lastModified: parseDate(p.updated_at) ?? parseDate(p.published_at) ?? now,
                changeFrequency: 'monthly' as const,
                priority: locale === DEFAULT_LOCALE ? 0.6 : 0.54,
                alternates: { languages: hreflangFor(`/journal/${p.slug}`) },
            })),
        );

    // Guard against a duplicate URL slipping in from any source.
    const all = [
        ...staticRoutes,
        ...landingRoutes,
        ...brandRoutes,
        ...categoryRoutes,
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
