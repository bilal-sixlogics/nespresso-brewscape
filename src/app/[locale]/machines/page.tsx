// Server Component for the machines listing.
//
// The whole page was a Client Component, so the server response for
// /fr/machines carried the H1 and not a single product link — which is what
// "0 résultats" in the audit actually was. The eight machines were in the API
// the entire time; they never reached the HTML, so the page meant to rank for
// "machine à café professionnelle", "grossiste machine à café" and
// "achat machine à café" offered a crawler nothing to rank.
//
// Now the first page is fetched here and the client hydrates over real markup.
import MachinesPageClient from './MachinesPageClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { CategoryContent } from '@/components/seo/CategoryContent';
import { getProductList } from '@/lib/api/server';
import { SITE_URL } from '@/lib/seo';
import { localePath, toLocale, type Locale } from '@/lib/i18n';
import { getDisplayPrice, isInStock, type Product } from '@/types';

export const revalidate = 3600;

// Must match the params MachinesPageClient builds for its unfiltered first
// view — `{ storefront_page: '/machines', per_page: 12 }`. If these drift, the
// seeded key stops matching and the grid visibly re-fetches on hydration.
const PER_PAGE = 12;

// Title, description, canonical, hreflang and the breadcrumb all come from
// ./layout.tsx, which already describes this route.

/**
 * ItemList of the machines actually on the page.
 *
 * Gives an answer engine the model names, prices and URLs without having to
 * infer the grid from markup — the listing equivalent of the Product schema
 * each detail page already carries.
 */
function buildItemList(locale: Locale, products: Product[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Machines à café professionnelles',
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

export default async function MachinesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);

    const initialProducts = await getProductList({
        storefrontPage: '/machines',
        perPage: PER_PAGE,
    });

    return (
        <>
            {initialProducts.products.length > 0 && (
                <JsonLd schema={buildItemList(locale, initialProducts.products)} />
            )}
            <MachinesPageClient initialProducts={initialProducts} />

            {/* Supporting content, French only — this is the locale being
                targeted, and inventing four translations of commercial copy
                nobody wrote would be worse than leaving the other locales as
                the product grid they already are.

                Placed below the grid deliberately: the catalogue stays the
                first thing a shopper sees, while the page gains the context it
                needs to rank. */}
            {locale === 'fr' && (
                <CategoryContent
                    locale={locale}
                    heading="Choisir une machine à café professionnelle"
                    intro={[
                        'Cafrezzo est grossiste et distributeur de machines à café, installé au 41 rue d’Aulnay à Gonesse, aux portes de Paris. Nous équipons les restaurants, hôtels, bars, coffee shops, bureaux et entreprises d’Île-de-France, et livrons dans toute la France.',
                        'Le critère qui décide n’est ni la marque ni le prix d’achat, mais le nombre de tasses servies par jour : c’est lui qui détermine le mode de préparation, la taille du groupe et le coût réel par tasse. Une machine tenue au-dessus de sa capacité s’use vite et donne un café irrégulier aux heures de pointe.',
                    ]}
                    blocks={[
                        {
                            heading: 'Machines à grains',
                            body: 'La mouture se fait à la demande : meilleure tasse et coût par tasse le plus bas, au prix d’un nettoyage quotidien du moulin. Le choix par défaut dès qu’il y a du volume et quelqu’un derrière le comptoir.',
                        },
                        {
                            heading: 'Machines automatiques',
                            body: 'Du grain à la tasse en un geste, sans réglage. Adaptées aux bureaux et aux libres-services, où personne n’est formé à ajuster une extraction.',
                        },
                        {
                            heading: 'Machines à capsules',
                            body: 'Aucun réglage, aucun entretien de moulin, dosage constant. Pertinentes pour les chambres d’hôtel et les points de consommation qui servent quelques cafés par jour.',
                        },
                    ]}
                    links={[
                        {
                            href: '/machine-a-cafe-professionnelle',
                            label: 'Guide : quelle machine professionnelle choisir',
                        },
                        { href: '/grossiste-machines-a-cafe', label: 'Grossiste machines à café' },
                        { href: '/professionnels', label: 'Notre offre pour les professionnels' },
                        { href: '/cafe-en-grains', label: 'Café en grains' },
                    ]}
                />
            )}
        </>
    );
}
