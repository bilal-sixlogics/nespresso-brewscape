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

/**
 * Per-category title and description, keyed by the catalogue's display NAME.
 *
 * Keyed by name rather than slug on purpose: the backend slugs do not match
 * their categories at all — GRAINS is slugged `delta-caf-s-grain`, SUCRES is
 * `lavazza-compatible-nespresso` — so a slug-keyed map would silently break
 * the day someone tidies them up in the admin panel.
 *
 * Written out per category because the previous version generated
 * `"${label} | Cafrezzo"` and one shared description sentence for all seven.
 * That produced titles as thin as "Moulu | Cafrezzo" and seven near-identical
 * descriptions — which is what makes a faceted URL look like duplicate chaff
 * rather than a category page worth indexing.
 */
interface CategorySeo {
    title: string;
    description: string;
}

const CATEGORY_SEO: Record<string, { fr: CategorySeo; en: CategorySeo }> = {
    GRAINS: {
        fr: {
            title: 'Café en Grains — Grossiste & Vente en Ligne',
            description:
                'Café en grains en conditionnement 1 kg : Lavazza, Delta Cafés, Bristot, Mambo et Kimbo. Cafrezzo, grossiste à Gonesse, livre particuliers et professionnels en Île-de-France et dans toute la France.',
        },
        en: {
            title: 'Coffee Beans — Wholesale & Online',
            description:
                'Coffee beans in 1 kg packs: Lavazza, Delta Cafés, Bristot, Mambo and Kimbo. Cafrezzo, a wholesaler near Paris, supplies both households and trade customers.',
        },
    },
    MOULU: {
        fr: {
            title: 'Café Moulu — Grossiste & Vente en Ligne',
            description:
                'Café moulu pour machines à filtre, percolateurs et cafetières. Marques Carte Noire, Lavazza et Delta Cafés. Grossiste à Gonesse, livraison offerte dès 150€.',
        },
        en: {
            title: 'Ground Coffee — Wholesale & Online',
            description:
                'Ground coffee for filter machines, percolators and cafetières, from Carte Noire, Lavazza and Delta Cafés. Free delivery over €150.',
        },
    },
    CAPSULES: {
        fr: {
            title: 'Capsules de Café Compatibles — Grossiste',
            description:
                'Capsules compatibles avec les principaux systèmes, dont Nespresso et Lavazza. Idéales pour chambres d’hôtel, salles de pause et petits points de consommation. Tarifs professionnels dégressifs.',
        },
        en: {
            title: 'Coffee Capsules — Wholesale',
            description:
                'Capsules compatible with the main systems, including Nespresso and Lavazza. Suited to hotel rooms, breakrooms and small serving points. Trade pricing available.',
        },
    },
    PODS: {
        fr: {
            title: 'Dosettes de Café — Grossiste pour Professionnels',
            description:
                'Dosettes souples pour un dosage constant sans réglage ni entretien de moulin. Approvisionnement régulier pour bureaux, hôtels et petites structures.',
        },
        en: {
            title: 'Coffee Pods — Wholesale for Business',
            description:
                'Soft pods for consistent dosing with no grinder to set or clean. Regular resupply for offices, hotels and smaller sites.',
        },
    },
    SOLUBLES: {
        fr: {
            title: 'Café Soluble & Boissons Instantanées — Grossiste',
            description:
                'Cafés solubles, chocolats et boissons instantanées pour distributeurs automatiques et espaces de pause. Marques Caprimo, Ristora et Prolait.',
        },
        en: {
            title: 'Instant Coffee & Drinks — Wholesale',
            description:
                'Instant coffee, chocolate and hot drinks for vending machines and breakrooms. Caprimo, Ristora and Prolait.',
        },
    },
    'THÉS': {
        fr: {
            title: 'Thés & Infusions — Grossiste pour Professionnels',
            description:
                'Thés et infusions pour compléter une offre de boissons chaudes sans multiplier les fournisseurs. Livraison en Île-de-France et dans toute la France.',
        },
        en: {
            title: 'Teas & Infusions — Wholesale',
            description:
                'Teas and infusions to round out a hot-drinks offer without adding suppliers. Delivered across France and neighbouring countries.',
        },
    },
    SUCRES: {
        fr: {
            title: 'Sucres & Consommables Café — Grossiste',
            description:
                'Sucres, bûchettes et consommables pour accompagner le service café en établissement. Achat au carton, tarifs dégressifs selon les quantités.',
        },
        en: {
            title: 'Sugar & Coffee Consumables — Wholesale',
            description:
                'Sugar sticks and consumables for coffee service in hospitality. Sold by the case, with quantity-based pricing.',
        },
    },
};

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

        const name = match.name.trim().toUpperCase();

        // Categories that now have a real, dedicated page consolidate onto it.
        //
        // A `?category=` facet and a clean category page targeting the same
        // intent are two URLs competing for one query — the cannibalisation
        // this whole structure is meant to avoid. The dedicated page has the
        // H1, the intro copy, the FAQ and the schema, so it wins the canonical
        // and the facet becomes a navigational view only.
        const DEDICATED_CATEGORY_PAGE: Record<string, string> = {
            GRAINS: '/cafe-en-grains',
            MOULU: '/cafe-moulu',
            CAPSULES: '/capsules-cafe',
        };

        const dedicated = DEDICATED_CATEGORY_PAGE[name];
        if (dedicated) {
            return {
                ...base,
                robots: { index: false, follow: true },
                alternates: { canonical: `${SITE_URL}${localePath(locale, dedicated)}` },
            };
        }

        const url = `${SITE_URL}${localePath(locale, `/shop?category=${category}`)}`;
        const seo = CATEGORY_SEO[name];

        // Indexable only where we have real, hand-written copy for the
        // language — French and English.
        //
        // These facets were indexable in all five locales while carrying French
        // metadata, which published a German and a Russian URL describing
        // themselves in French. That is five near-duplicates per category
        // rather than one page worth ranking. Where there is no copy, the facet
        // consolidates back onto /shop instead.
        const copy = locale === 'fr' ? seo?.fr : locale === 'en' ? seo?.en : undefined;

        if (!copy) {
            return {
                ...base,
                robots: { index: false, follow: true },
                alternates: { canonical: `${SITE_URL}${localePath(locale, '/shop')}` },
            };
        }

        return {
            ...base,
            title: { absolute: `${copy.title} | Cafrezzo` },
            description: copy.description,
            alternates: {
                canonical: url,
                // Only the two locales this facet is published in, matching the
                // page's own robots directive.
                languages: {
                    'fr-FR': `${SITE_URL}${localePath('fr', `/shop?category=${category}`)}`,
                    'en-GB': `${SITE_URL}${localePath('en', `/shop?category=${category}`)}`,
                    'x-default': `${SITE_URL}${localePath('fr', `/shop?category=${category}`)}`,
                },
            },
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
