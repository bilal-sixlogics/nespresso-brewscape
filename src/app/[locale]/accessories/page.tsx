// Server Component for the accessories listing.
//
// Was a Client Component, so the server response carried the H1 and zero
// product links — the same defect as /machines. The catalogue was in the API
// but never in the HTML, leaving crawlers an empty listing on an indexable
// commercial page.
//
// Now the first page is fetched here and the client hydrates over real markup.
import AccessoriesPageClient from './AccessoriesPageClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { getProductList } from '@/lib/api/server';
import { SITE_URL } from '@/lib/seo';
import { localePath, toLocale, type Locale } from '@/lib/i18n';
import { getDisplayPrice, isInStock, type Product } from '@/types';

export const revalidate = 3600;

// Must match the params AccessoriesPageClient builds for its unfiltered first view.
const PER_PAGE = 12;

/** ItemList of what is actually on the page, for answer engines. */
function buildItemList(locale: Locale, products: Product[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.slice(0, 20).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'Product',
                name: p.name,
                url: `${SITE_URL}${localePath(locale, `/shop/${p.slug ?? ''}`)}`,
                ...(p.brand?.name ? { brand: { '@type': 'Brand', name: p.brand.name } } : {}),
                offers: {
                    '@type': 'Offer',
                    priceCurrency: 'EUR',
                    price: getDisplayPrice(p).toFixed(2),
                    availability: isInStock(p)
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                },
            },
        })),
    };
}

export default async function AccessoriesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);

    const initialProducts = await getProductList({
        storefrontPage: '/accessories',
        perPage: PER_PAGE,
    });

    return (
        <>
            {initialProducts.products.length > 0 && (
                <JsonLd schema={buildItemList(locale, initialProducts.products)} />
            )}
            <AccessoriesPageClient initialProducts={initialProducts} />
        </>
    );
}
