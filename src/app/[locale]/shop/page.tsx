// Server Component for the shop listing.
//
// Previously this whole page was a Client Component wrapped in <Suspense>
// because it called useSearchParams(). The Suspense fallback — an empty div —
// was the entire server-rendered output, so every crawler saw a blank <main>
// on the site's main catalogue page.
//
// Now the query params are read here, the first page of results is fetched on
// the server, and the client component hydrates over real markup.
import type { Metadata } from 'next';

import ShopPageClient from './ShopPageClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { getProductList } from '@/lib/api/server';
import { generateBreadcrumbSchema, pageMetadata, SITE_URL } from '@/lib/seo';
import { localePath, toLocale, type Locale } from '@/lib/i18n';

export const revalidate = 3600;

type SearchParams = Promise<{ category?: string; brand?: string }>;

const PER_PAGE = 20;

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: SearchParams;
}): Promise<Metadata> {
    const locale = toLocale((await params).locale);
    const { category, brand } = await searchParams;

    const base = pageMetadata({
        locale,
        title: 'Boutique — Cafés, Capsules & Machines',
        description:
            'Parcourez tout le catalogue Cafrezzo : cafés en grains, moulus, capsules compatibles, machines et gourmandises. Livraison offerte dès 150€.',
        path: '/shop',
        titleKey: 'shopMetaTitle',
        descriptionKey: 'shopMetaDescription',
    });

    // A filtered view is a slice of the same listing, not a separate page.
    // Point it back at the bare /shop canonical so the variants consolidate
    // instead of competing as near-duplicates.
    if (category || brand) {
        return {
            ...base,
            robots: { index: false, follow: true },
            alternates: { canonical: `${SITE_URL}${localePath(locale, '/shop')}` },
        };
    }

    return base;
}

/** ItemList of what is actually on the page — helps answer engines read the listing. */
function buildItemList(locale: Locale, products: { slug?: string; name: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.slice(0, 20).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
            url: `${SITE_URL}${localePath(locale, `/shop/${p.slug ?? ''}`)}`,
        })),
    };
}

export default async function ShopPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: SearchParams;
}) {
    const locale = toLocale((await params).locale);
    const { category, brand } = await searchParams;

    // Same params the client hook will build, so the hydrated state matches the
    // server markup and the grid does not visibly swap.
    const initialProducts = await getProductList({
        storefrontPage: '/shop',
        category,
        brand,
        perPage: PER_PAGE,
    });

    return (
        <>
            <JsonLd
                schema={[
                    generateBreadcrumbSchema(locale, [
                        { name: 'Accueil', url: '/' },
                        { name: 'Boutique', url: '/shop' },
                    ]),
                    ...(initialProducts.products.length
                        ? [buildItemList(locale, initialProducts.products)]
                        : []),
                ]}
            />
            <ShopPageClient
                initialCategory={category}
                initialBrand={brand}
                initialProducts={initialProducts}
            />
        </>
    );
}
