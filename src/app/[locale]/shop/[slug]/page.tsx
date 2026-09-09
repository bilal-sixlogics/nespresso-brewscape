// Server Component — owns metadata, structured data and the initial payload
// for the product detail page. params is a Promise in Next.js 15+.
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';

import ProductDetailPageClient from './ProductDetailPageClient';
import { JsonLd } from '@/components/seo/JsonLd';
import {
    findClosestProductSlug,
    getAllProductSlugs,
    getProductBySlug,
    probeApiReachable,
} from '@/lib/api/server';
import { generateProductMetadata, generateBreadcrumbSchema, generateProductSchema } from '@/lib/seo';
import { LOCALES, localePath, toLocale } from '@/lib/i18n';
import { getProductImage, getDisplayPrice, isInStock, getDefaultUnit } from '@/types';

// Revalidate hourly rather than rendering fresh on every hit. `force-dynamic`
// previously meant no cached HTML at all, and — combined with client-side
// fetching — crawlers received an empty shell for every product.
export const revalidate = 3600;

/**
 * Pre-render every product at build time so a crawler's first visit is served
 * cached HTML rather than paying for an on-demand render. Slugs not in this
 * list still render on demand (`dynamicParams` defaults to true), so newly
 * added products work immediately without a redeploy.
 */
export async function generateStaticParams() {
    const slugs = await getAllProductSlugs();
    // Every product in every locale: 104 products x 5 locales.
    return LOCALES.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

// Strips HTML and collapses whitespace so descriptions are safe to place in a
// meta tag. Product descriptions come from the admin rich-text editor.
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
    const product = await getProductBySlug(slug);

    if (!product) {
        // Unknown or unreachable — do not advertise a page we cannot describe.
        return { title: 'Produit introuvable', robots: { index: false, follow: true } };
    }

    // The backend already exposes per-product SEO overrides; prefer them.
    return generateProductMetadata({
        locale,
        name: product.meta_title || product.name,
        description: product.meta_description || toPlainText(product.description),
        slug: product.slug,
        image: getProductImage(product) ?? '/coffee-beans.jpg',
        price: getDisplayPrice(product),
        category: product.category?.name,
    });
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale: rawLocale, slug } = await params;
    const locale = toLocale(rawLocale);
    const product = await getProductBySlug(slug);

    if (!product) {
        // If the backend is down, every product URL would 404 at once and
        // invite mass deindexing. Only treat a miss as authoritative when the
        // API is actually reachable; otherwise fall through to the client's
        // own not-found state under a 200, which is recoverable.
        if (!(await probeApiReachable())) {
            return <ProductDetailPageClient slug={slug} />;
        }

        // Before giving up, see whether this near-misses a live product.
        // Catches AI-invented or truncated product URLs, and the 19 fictional
        // slugs that shipped in the sitemap for months. Returns null unless
        // the match is unambiguous, so a wrong guess is not sent to anyone.
        const closest = await findClosestProductSlug(slug);
        // permanentRedirect throws a control-flow signal — it must not sit
        // inside a try/catch, and nothing after it runs.
        // Redirect within the same locale so a German near-miss does not land
        // the visitor on the French page.
        if (closest) permanentRedirect(localePath(locale, `/shop/${closest}`));

        notFound();
    }

    const image = getProductImage(product) ?? '/coffee-beans.jpg';
    const description = product.meta_description || toPlainText(product.description);

    const productSchema = {
        ...generateProductSchema({
            locale,
            name: product.name,
            description,
            slug: product.slug,
            image,
            price: getDisplayPrice(product),
            inStock: isInStock(product),
            sku: getDefaultUnit(product)?.sku,
            ratingValue: product.average_rating,
            reviewCount: product.reviews_count,
            // The real roaster (Lavazza, Delta, Bristot, ...). Passed in rather
            // than spread over the result afterwards so there is one code path
            // deciding the brand instead of two.
            brand: product.brand?.name,
        }),
        ...(product.category?.name ? { category: product.category.name } : {}),
    };

    const breadcrumbSchema = generateBreadcrumbSchema(locale, [
        { name: 'Accueil', url: '/' },
        { name: 'Boutique', url: '/shop' },
        ...(product.category?.name
            ? [{ name: product.category.name, url: `/shop?category=${product.category.slug}` }]
            : []),
        { name: product.name, url: `/shop/${product.slug}` },
    ]);

    return (
        <>
            <JsonLd schema={[productSchema, breadcrumbSchema]} />
            <ProductDetailPageClient slug={slug} initialProduct={product} />
        </>
    );
}
