/**
 * Server-side data fetching for SEO.
 *
 * Separate from `lib/api/client.ts`, which reads localStorage for the auth
 * token and guest session id and therefore cannot run during SSR.
 *
 * Everything here is read-only, unauthenticated, public catalogue data — the
 * same payload an anonymous visitor receives. Its purpose is to put real
 * content into the initial HTML so that crawlers which do not execute
 * JavaScript can read it.
 */

// IMPORTANT: import this module from Server Components only. It is safe on the
// server but has no client fallback for auth/session headers. (The `server-only`
// package would enforce this at build time; it is not a dependency here.)

import { Endpoints } from './endpoints';
import type { PaginationMeta } from './types';
import type { Product } from '@/types';

// Catalogue changes are infrequent; an hour keeps pages fresh without
// hammering the API on every crawl.
const REVALIDATE_SECONDS = 3600;

async function getJson<T>(url: string, label: string): Promise<T | null> {
    try {
        const res = await fetch(url, {
            headers: { Accept: 'application/json' },
            next: { revalidate: REVALIDATE_SECONDS },
        });
        if (!res.ok) {
            // 404 is an expected outcome for an unknown slug, not a fault.
            if (res.status !== 404) {
                console.error(`[server-api] ${label} responded ${res.status}`);
            }
            return null;
        }
        return (await res.json()) as T;
    } catch (err) {
        console.error(`[server-api] ${label} fetch failed:`, err);
        return null;
    }
}

/**
 * Fetches one product by slug for server rendering.
 *
 * Returns null when the product does not exist OR when the API is unreachable.
 * Callers must not treat null as "definitely missing" — see the note in
 * `shop/[slug]/page.tsx` about why an API outage must not emit a 404.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
    const body = await getJson<{ data: Product } | Product>(
        Endpoints.product(slug),
        `product:${slug}`,
    );
    if (!body) return null;
    // The API wraps single resources in `{ data: ... }`; tolerate both shapes.
    const product = (body as { data?: Product }).data ?? (body as Product);
    return product && typeof product === 'object' && 'slug' in product ? product : null;
}

export interface ProductListResult {
    products: Product[];
    // Same shape the client hook stores, so server output can seed it directly.
    meta: PaginationMeta | null;
}

/**
 * Fetches a page of the catalogue for server rendering.
 *
 * Mirrors the params the client hook sends so the markup the server paints and
 * the state the client hydrates with are the same list — otherwise the grid
 * would visibly swap on hydration.
 */
export async function getProductList(params: {
    storefrontPage?: string;
    category?: string;
    brand?: string;
    perPage?: number;
}): Promise<ProductListResult> {
    const qs = new URLSearchParams();
    qs.set('per_page', String(params.perPage ?? 20));
    if (params.storefrontPage) qs.set('storefront_page', params.storefrontPage);
    if (params.category) qs.set('category', params.category);
    if (params.brand) qs.set('brand', params.brand);

    const body = await getJson<{ data: Product[]; meta: ProductListResult['meta'] }>(
        `${Endpoints.products}?${qs.toString()}`,
        'product list',
    );

    if (!body || !Array.isArray(body.data)) return { products: [], meta: null };
    return { products: body.data, meta: body.meta ?? null };
}

/**
 * All active product slugs, for `generateStaticParams()`.
 *
 * Returning [] is safe: Next then renders each product on demand instead of at
 * build time, so a flaky API degrades build output rather than breaking it.
 */
export async function getAllProductSlugs(): Promise<string[]> {
    const body = await getJson<{ data: Product[] }>(
        `${Endpoints.products}?per_page=500`,
        'product slugs',
    );
    const items = body?.data;
    if (!Array.isArray(items)) return [];
    return items
        .filter(p => p?.slug && p.status !== 'inactive' && p.status !== 'draft')
        .map(p => p.slug as string);
}

// Short/common tokens that carry no identifying signal when matching slugs.
const SLUG_STOPWORDS = new Set(['de', 'du', 'la', 'le', 'les', 'et', 'a', 'the', 'of']);

function slugTokens(slug: string): Set<string> {
    return new Set(
        slug
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter(t => t.length > 1 && !SLUG_STOPWORDS.has(t)),
    );
}

function similarity(a: string, b: string): number {
    const A = slugTokens(a);
    const B = slugTokens(b);
    if (!A.size || !B.size) return 0;
    let intersection = 0;
    for (const t of A) if (B.has(t)) intersection++;
    return intersection / (A.size + B.size - intersection); // Jaccard
}

/** Confidence needed before redirecting rather than 404ing. */
const MATCH_THRESHOLD = 0.6;
/** Minimum lead over the runner-up; below this the request is ambiguous. */
const MATCH_MARGIN = 0.15;

/**
 * Finds the live product a near-miss URL most likely meant, or null.
 *
 * Two sources of near-miss traffic make this worth doing:
 *  - AI assistants inventing or truncating product URLs when they answer.
 *  - 19 fictional product URLs that shipped in the sitemap for months and are
 *    now dead (they came from the legacy mock catalogue in lib/productsData).
 *
 * Deliberately conservative: sending someone to the WRONG product is worse
 * than a 404, so it requires both a high score and a clear lead over the next
 * candidate. On anything ambiguous it returns null and the caller 404s.
 */
export async function findClosestProductSlug(slug: string): Promise<string | null> {
    const slugs = await getAllProductSlugs();
    if (!slugs.length) return null;

    const scored = slugs
        .map(candidate => ({ slug: candidate, score: similarity(slug, candidate) }))
        .sort((a, b) => b.score - a.score);

    const [best, runnerUp] = scored;
    if (!best || best.score < MATCH_THRESHOLD) return null;
    if (runnerUp && best.score - runnerUp.score < MATCH_MARGIN) return null;
    return best.slug;
}

export interface BlogPost {
    id: number;
    title: string;
    slug?: string;
    category?: string;
    excerpt?: string;
    body?: string;
    featured_image?: string;
    author_name?: string;
    meta_title?: string;
    meta_description?: string;
    published_at?: string;
    updated_at?: string;
}

/** Fetches one blog post by id for server rendering. Null when missing. */
export async function getBlogPost(id: string): Promise<BlogPost | null> {
    const body = await getJson<{ data: BlogPost } | BlogPost>(
        Endpoints.blogPost(id),
        `blog:${id}`,
    );
    if (!body) return null;
    const post = (body as { data?: BlogPost }).data ?? (body as BlogPost);
    return post && typeof post === 'object' && 'title' in post ? post : null;
}

/**
 * Every published blog post.
 *
 * Pages through the endpoint rather than taking whatever one request returns.
 * The blog API defaults to `per_page=12` and there are currently 17 posts, so
 * the previous single unparameterised request silently dropped five of them —
 * they were missing from the sitemap, missing from generateStaticParams(), and
 * missing from the journal index. Asking for a large page and then following
 * `last_page` fixes both the current shortfall and the next one.
 */
const BLOG_PAGE_SIZE = 100;
/** Backstop for an API that ignores `page` and keeps returning full pages. */
const MAX_BLOG_PAGES = 10;

export async function getBlogPosts(): Promise<BlogPost[]> {
    const all: BlogPost[] = [];

    for (let page = 1; page <= MAX_BLOG_PAGES; page++) {
        const body = await getJson<
            { data?: BlogPost[]; meta?: { last_page?: number } } | BlogPost[]
        >(`${Endpoints.blogPosts}?per_page=${BLOG_PAGE_SIZE}&page=${page}`, `blog list p${page}`);
        if (!body) break;

        const items = Array.isArray(body) ? body : body.data;
        if (!Array.isArray(items) || items.length === 0) break;
        all.push(...items);

        // A bare array carries no pagination info, so one request is all there is.
        const lastPage = Array.isArray(body) ? 1 : (body.meta?.last_page ?? 1);
        if (page >= lastPage) break;
    }

    // De-duplicate by slug: an API that ignores `page` would otherwise return
    // the same posts repeatedly and multiply every journal URL in the sitemap.
    const seen = new Set<string>();
    return all.filter(post => {
        const key = post.slug ?? String(post.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Distinguishes "product does not exist" from "we could not reach the API".
 * Used by the PDP so a backend outage does not mass-emit 404s to crawlers.
 */
export async function probeApiReachable(): Promise<boolean> {
    try {
        const res = await fetch(`${Endpoints.products}?per_page=1`, {
            headers: { Accept: 'application/json' },
            next: { revalidate: 60 },
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ── Brands & categories ──────────────────────────────────────────────────────

export interface ApiBrand {
    id: number;
    name: string;
    slug?: string;
    logo?: string | null;
    description?: string | null;
    status?: string;
}

export interface ApiCategory {
    id: number;
    name: string;
    slug?: string;
    icon_url?: string | null;
    description?: string | null;
    status?: string;
    storefront_page?: string;
}

/** Every active brand in the catalogue. Used by /marques and the sitemap. */
export async function getBrands(): Promise<ApiBrand[]> {
    const body = await getJson<{ data: ApiBrand[] } | ApiBrand[]>(Endpoints.brands, 'brands');
    if (!body) return [];
    const items = Array.isArray(body) ? body : (body as { data?: ApiBrand[] }).data;
    if (!Array.isArray(items)) return [];
    return items.filter(b => b?.slug && b.status !== 'inactive');
}

/** One brand by slug, or null when unknown/unreachable. */
export async function getBrandBySlug(slug: string): Promise<ApiBrand | null> {
    const brands = await getBrands();
    return brands.find(b => b.slug === slug) ?? null;
}

/** Every active category. */
export async function getCategories(): Promise<ApiCategory[]> {
    const body = await getJson<{ data: ApiCategory[] } | ApiCategory[]>(
        Endpoints.categories,
        'categories',
    );
    if (!body) return [];
    const items = Array.isArray(body) ? body : (body as { data?: ApiCategory[] }).data;
    if (!Array.isArray(items)) return [];
    return items.filter(c => c?.slug && c.status !== 'inactive');
}

/**
 * Products in the category with this display name, e.g. 'GRAINS' or 'MACHINES'.
 *
 * Resolves the name to a slug at request time rather than hardcoding one. The
 * catalogue's category slugs do not match their names — 'GRAINS' is currently
 * slugged `delta-caf-s-grain` and 'MACHINES' is `machine-capsule-delta-q`,
 * both leftovers from how the categories were first created. Hardcoding those
 * strings into page files would break silently the day someone tidies them up
 * in the admin panel.
 *
 * Returns [] when the category or the API is unavailable, which the callers
 * render as "no product grid" rather than an error.
 */
export async function getProductsInCategoryNamed(
    name: string,
    perPage = 8,
): Promise<Product[]> {
    const categories = await getCategories();
    const match = categories.find(c => c.name?.trim().toUpperCase() === name.trim().toUpperCase());
    if (!match?.slug) {
        console.warn(`[server-api] no category named "${name}"; omitting its product grid`);
        return [];
    }
    const { products } = await getProductList({ category: match.slug, perPage });
    return products;
}
