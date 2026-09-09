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
import { getCategories, getProductList } from '@/lib/api/server';
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

    // A brand filter now has a proper home at /marques/<slug> — a real page
    // with its own copy, FAQ and Brand schema. Point the query-param variant
    // there rather than at /shop, so whatever authority `?brand=lavazza` has
    // accumulated consolidates onto the page built to rank for "café Lavazza".
    if (brand) {
        return {
            ...base,
            robots: { index: false, follow: true },
            alternates: { canonical: `${SITE_URL}${localePath(locale, `/marques/${brand}`)}` },
        };
    }

    // Category views ARE indexable, as of this change.
    //
    // They were noindex and canonicalised to /shop, on the reasoning that a
    // filtered slice is a duplicate of the listing. That was correct while the
    // page could not describe itself — but /shop is now a Server Component
    // that reads searchParams and renders the filtered grid server-side, which
    // was the stated prerequisite. So each category can now carry its own
    // title, description and self-canonical, giving "café en grains", "café
    // moulu" and "capsules" somewhere to land instead of pointing every
    // category query at an undifferentiated catalogue.
    if (category) {
        const categories = await getCategories();
        const match = categories.find(c => c.slug === category);

        // Unknown slug: nothing to describe, so keep it out of the index
        // rather than publishing an empty grid under an invented title.
        if (!match?.name) {
            return {
                ...base,
                robots: { index: false, follow: true },
                alternates: { canonical: `${SITE_URL}${localePath(locale, '/shop')}` },
            };
        }

        // Category names come from the admin in caps ("GRAINS"); title-case
        // them so the <title> is not shouting.
        const label = match.name.charAt(0).toUpperCase() + match.name.slice(1).toLowerCase();
        const url = `${SITE_URL}${localePath(locale, `/shop?category=${category}`)}`;

        return {
            ...base,
            title: { absolute: `${label} | Cafrezzo` },
            description: `${label} disponible chez Cafrezzo, grossiste et distributeur de café aux portes de Paris. Vente aux particuliers et aux professionnels, livraison offerte dès 150€.`,
            alternates: { canonical: url },
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
