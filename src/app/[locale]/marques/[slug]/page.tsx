// Brand pages: "café Lavazza", "café Lavazza professionnel", "grossiste café
// Lavazza", "café Delta", "café Bristot", "café Carte Noire", "café Mambo".
//
// These did not exist. The only way to see one brand's products was
// /shop?brand=<slug>, which the shop page canonicalises back to /shop and
// marks noindex — so the fourteen brands Cafrezzo actually distributes had no
// indexable page anywhere on the site, and every brand query went to a
// competitor by default.
//
// Content is generated from the real catalogue (how many references, which
// formats, which price range) rather than from a template with the brand name
// substituted in. Nothing about the brand is asserted that is not either
// public knowledge about a major roaster or read off Cafrezzo's own stock.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { JsonLd } from '@/components/seo/JsonLd';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { CupSeparator } from '@/components/ui/CupSeparator';
import { getBrandBySlug, getBrands, getProductList } from '@/lib/api/server';
import {
    FR_EN,
    generateBreadcrumbSchema,
    generateFaqSchema,
    pageMetadata,
    SITE_URL,
} from '@/lib/seo';
import { localePath, toLocale, type Locale } from '@/lib/i18n';
import { getDisplayPrice, getProductImage, type Product } from '@/types';

export const revalidate = 3600;

/**
 * Pre-render every brand page in the locales it is published in.
 *
 * Brands change far less often than products, so these are cheap to build and
 * worth having as cached HTML for a crawler's first visit.
 */
export async function generateStaticParams() {
    const brands = await getBrands();
    return FR_EN.flatMap(locale =>
        brands
            .filter(b => b.slug)
            .map(b => ({ locale, slug: b.slug as string })),
    );
}

/**
 * One-line provenance for the roasters where it is uncontroversial public
 * knowledge. Deliberately incomplete: a brand absent from this map simply gets
 * no origin sentence, which is better than a guessed one.
 */
const BRAND_ORIGIN: Record<string, { fr: string; en: string }> = {
    lavazza: {
        fr: 'Lavazza est un torréfacteur italien fondé à Turin en 1895.',
        en: 'Lavazza is an Italian coffee roaster founded in Turin in 1895.',
    },
    'lavazza-a-modo-mio': {
        fr: 'Lavazza A Modo Mio est le système de capsules domestiques du torréfacteur italien Lavazza.',
        en: 'Lavazza A Modo Mio is the Italian roaster’s home capsule system.',
    },
    'lavazza-blue': {
        fr: 'Lavazza Blue est le système de capsules professionnelles de Lavazza, conçu pour les bureaux et la restauration.',
        en: 'Lavazza Blue is Lavazza’s professional capsule system, built for offices and food service.',
    },
    'lavazza-point': {
        fr: 'Lavazza Point est un système de capsules professionnelles de Lavazza destiné à un usage intensif.',
        en: 'Lavazza Point is a Lavazza professional capsule system intended for heavy use.',
    },
    delta: {
        fr: 'Delta Cafés est un torréfacteur portugais, l’une des principales marques de café du Portugal.',
        en: 'Delta Cafés is a Portuguese roaster and one of Portugal’s leading coffee brands.',
    },
    bristot: {
        fr: 'Bristot est un torréfacteur italien établi à Belluno, en Vénétie, depuis 1919.',
        en: 'Bristot is an Italian roaster based in Belluno, in the Veneto, since 1919.',
    },
    'carte-noir': {
        fr: 'Carte Noire est une marque de café française, largement diffusée en France.',
        en: 'Carte Noire is a French coffee brand, widely distributed in France.',
    },
    kimbo: {
        fr: 'Kimbo est un torréfacteur napolitain, référence de l’espresso du sud de l’Italie.',
        en: 'Kimbo is a Neapolitan roaster, a reference for southern Italian espresso.',
    },
    covim: {
        fr: 'Covim est un torréfacteur italien basé à Gênes.',
        en: 'Covim is an Italian roaster based in Genoa.',
    },
    nespresso: {
        fr: 'Nespresso est le système de capsules du groupe Nestlé.',
        en: 'Nespresso is the Nestlé group’s capsule system.',
    },
};

/** Formats present in this brand's stock, derived from its category names. */
function describeFormats(products: Product[], locale: Locale): string[] {
    const names = new Set(
        products.map(p => p.category?.name?.trim().toUpperCase()).filter(Boolean) as string[],
    );
    const fr: Record<string, string> = {
        GRAINS: 'café en grains',
        MOULU: 'café moulu',
        CAPSULES: 'capsules',
        SOLUBLES: 'boissons solubles',
        'THÉS': 'thés',
        MACHINES: 'machines à café',
    };
    const en: Record<string, string> = {
        GRAINS: 'coffee beans',
        MOULU: 'ground coffee',
        CAPSULES: 'capsules',
        SOLUBLES: 'instant drinks',
        'THÉS': 'teas',
        MACHINES: 'coffee machines',
    };
    const dict = locale === 'en' ? en : fr;
    return [...names].map(n => dict[n]).filter(Boolean);
}

/** Joins a list the way the language does: "a, b et c" / "a, b and c". */
function listJoin(items: string[], locale: Locale): string {
    if (items.length <= 1) return items[0] ?? '';
    const last = items[items.length - 1];
    return `${items.slice(0, -1).join(', ')} ${locale === 'en' ? 'and' : 'et'} ${last}`;
}

/**
 * H1 that matches what the brand actually sells here.
 *
 * "Café Lavazza" is the target phrasing, but the same template applied to a
 * machines-only or instant-drinks-only brand would state something untrue, so
 * the heading is chosen from the categories in stock.
 */
function buildHeading(name: string, products: Product[], locale: Locale): string {
    const cats = new Set(
        products.map(p => p.category?.name?.trim().toUpperCase()).filter(Boolean) as string[],
    );
    const isCoffee = ['GRAINS', 'MOULU', 'CAPSULES'].some(c => cats.has(c));
    const onlyMachines = cats.size > 0 && [...cats].every(c => c === 'MACHINES');

    if (isCoffee) return locale === 'en' ? `${name} Coffee` : `Café ${name}`;
    if (onlyMachines) {
        return locale === 'en' ? `${name} Coffee Machines` : `Machines à café ${name}`;
    }
    return locale === 'en' ? `${name} at Cafrezzo` : `${name} chez Cafrezzo`;
}

async function loadBrand(slug: string) {
    const brand = await getBrandBySlug(slug);
    if (!brand) return null;
    // A brand can legitimately have nothing in stock right now; the page still
    // renders, minus the product grid.
    const { products } = await getProductList({ brand: slug, perPage: 48 });
    return { brand, products };
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale: rawLocale, slug } = await params;
    const locale = toLocale(rawLocale);
    const loaded = await loadBrand(slug);

    if (!loaded) {
        return { title: 'Marque introuvable', robots: { index: false, follow: true } };
    }

    const { brand, products } = loaded;
    const heading = buildHeading(brand.name, products, locale);
    const formats = describeFormats(products, locale);

    const description =
        locale === 'en'
            ? `${brand.name} at Cafrezzo, coffee wholesaler and distributor near Paris. ${
                  formats.length ? `Available as ${listJoin(formats, locale)}. ` : ''
              }For home and trade customers, with free delivery over €150.`
            : `${heading} chez Cafrezzo, grossiste et distributeur de café aux portes de Paris. ${
                  formats.length ? `Disponible en ${listJoin(formats, locale)}. ` : ''
              }Vente aux particuliers et aux professionnels, livraison offerte dès 150€.`;

    return pageMetadata({
        locale,
        title:
            locale === 'en'
                ? `${heading} — Wholesaler & Distributor`
                : `${heading} | Grossiste & Distributeur`,
        description,
        path: `/marques/${slug}`,
        image: products.length ? (getProductImage(products[0]) ?? undefined) : undefined,
        locales: FR_EN,
    });
}

export default async function BrandPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale: rawLocale, slug } = await params;
    const locale = toLocale(rawLocale);

    if (!FR_EN.includes(locale)) notFound();

    const loaded = await loadBrand(slug);
    if (!loaded) notFound();

    const { brand, products } = loaded;
    const en = locale === 'en';
    const heading = buildHeading(brand.name, products, locale);
    const formats = describeFormats(products, locale);
    const origin = BRAND_ORIGIN[slug]?.[en ? 'en' : 'fr'];

    const prices = products.map(getDisplayPrice).filter(p => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : null;

    const faqs = [
        {
            question: en
                ? `Where can I buy ${brand.name} coffee?`
                : `Où acheter du café ${brand.name} ?`,
            answer: en
                ? `Cafrezzo distributes ${brand.name} from its shop at 30 rue de l’Escouvrier, 95200 Sarcelles, near Paris, and online with delivery across France, Belgium, Luxembourg and Switzerland. ${products.length} ${brand.name} references are currently in the catalogue.`
                : `Cafrezzo distribue ${brand.name} depuis sa boutique du 30 rue de l’Escouvrier, 95200 Sarcelles, aux portes de Paris, et en ligne avec livraison en France, en Belgique, au Luxembourg et en Suisse. ${products.length} références ${brand.name} sont actuellement au catalogue.`,
        },
        {
            question: en
                ? `Do you supply ${brand.name} to businesses?`
                : `Fournissez-vous du café ${brand.name} aux professionnels ?`,
            answer: en
                ? `Yes. Cafrezzo is a coffee wholesaler and distributor and supplies ${brand.name} to cafés, restaurants, hotels, bars, coffee shops, offices and companies, with pricing tiered by quantity. Contact us with your volumes for a trade quote.`
                : `Oui. Cafrezzo est grossiste et distributeur de café et fournit ${brand.name} aux cafés, restaurants, hôtels, bars, coffee shops, bureaux et entreprises, avec des tarifs dégressifs selon les quantités. Contactez-nous en précisant vos volumes pour recevoir une offre professionnelle.`,
        },
    ];

    if (formats.length) {
        faqs.push({
            question: en
                ? `Which ${brand.name} formats are available?`
                : `Sous quels formats le café ${brand.name} est-il disponible ?`,
            answer: en
                ? `${brand.name} is currently available as ${listJoin(formats, locale)} at Cafrezzo.`
                : `${brand.name} est actuellement disponible en ${listJoin(formats, locale)} chez Cafrezzo.`,
        });
    }

    const itemList = products.length
        ? {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: heading,
              itemListElement: products.slice(0, 30).map((p, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  name: p.name,
                  url: `${SITE_URL}${localePath(locale, `/shop/${p.slug ?? ''}`)}`,
              })),
          }
        : null;

    // The brand itself, as an entity. This is what ties the page to the
    // "Lavazza" / "Delta Cafés" entity in Google's graph rather than leaving it
    // as an untyped product listing.
    const brandSchema = {
        '@context': 'https://schema.org',
        '@type': 'Brand',
        name: brand.name,
        ...(brand.logo ? { logo: brand.logo } : {}),
        ...(origin ? { description: origin } : {}),
        url: `${SITE_URL}${localePath(locale, `/marques/${slug}`)}`,
    };

    return (
        <div className="w-full relative bg-ink text-sand overflow-x-hidden grain-overlay">
            <JsonLd
                schema={[
                    brandSchema,
                    generateBreadcrumbSchema(locale, [
                        { name: en ? 'Home' : 'Accueil', url: '/' },
                        { name: en ? 'Brands' : 'Marques', url: '/marques' },
                        { name: heading, url: `/marques/${slug}` },
                    ]),
                    generateFaqSchema(faqs),
                    ...(itemList ? [itemList] : []),
                ]}
            />

            <section className="pt-20 pb-10 px-4 sm:px-8">
                <div className="max-w-[1000px] mx-auto text-center">
                    {brand.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={brand.logo}
                            alt={en ? `${brand.name} logo` : `Logo ${brand.name}`}
                            className="h-16 w-auto mx-auto mb-8 object-contain"
                        />
                    )}
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight mb-8">
                        {heading}
                    </h1>
                    <div className="max-w-xs mx-auto mb-10">
                        <CupSeparator tone="gold" />
                    </div>
                    <div className="space-y-5 text-left">
                        {origin && <p className="text-sand/70 text-lg leading-relaxed">{origin}</p>}
                        <p className="text-sand/70 text-lg leading-relaxed">
                            {en
                                ? `Cafrezzo is a coffee wholesaler and distributor based in Sarcelles, on the edge of Paris, and distributes ${brand.name}${
                                      formats.length ? ` as ${listJoin(formats, locale)}` : ''
                                  }. ${products.length} reference${products.length === 1 ? '' : 's'} ${
                                      products.length === 1 ? 'is' : 'are'
                                  } currently in the catalogue, for both home and trade customers.`
                                : `Cafrezzo est grossiste et distributeur de café, installé à Sarcelles, aux portes de Paris, et distribue ${brand.name}${
                                      formats.length ? ` en ${listJoin(formats, locale)}` : ''
                                  }. ${products.length} référence${products.length === 1 ? '' : 's'} ${
                                      products.length === 1 ? 'est' : 'sont'
                                  } actuellement au catalogue, pour les particuliers comme pour les professionnels.`}
                        </p>
                        {minPrice !== null && (
                            <p className="text-sand/70 text-lg leading-relaxed">
                                {en
                                    ? `Prices start at €${minPrice.toFixed(2)}. Delivery is free above €150, across France, Belgium, Luxembourg and Switzerland.`
                                    : `À partir de ${minPrice.toFixed(2).replace('.', ',')} €. Livraison offerte dès 150 € d’achat, en France, en Belgique, au Luxembourg et en Suisse.`}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Product grid — the reason the page exists. Every card is a
                crawlable link down to a product detail page. */}
            {products.length > 0 && (
                <section className="py-10 px-4 sm:px-8">
                    <div className="max-w-[1200px] mx-auto">
                        <h2 className="font-display text-3xl uppercase tracking-tight mb-10">
                            {en ? `${brand.name} products` : `Les produits ${brand.name}`}
                        </h2>
                        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map(product => {
                                const image = getProductImage(product);
                                return (
                                    <li key={product.slug ?? product.id}>
                                        <Link
                                            href={localePath(locale, `/shop/${product.slug}`)}
                                            className="group block"
                                        >
                                            <div className="rounded-[24px] overflow-hidden aspect-square bg-sand/5 mb-4 border border-sand/10">
                                                {image && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={image}
                                                        alt={`${product.name} — ${brand.name}`}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                )}
                                            </div>
                                            <span className="block text-sm font-bold text-sand leading-snug group-hover:text-gold transition-colors">
                                                {product.name}
                                            </span>
                                            <span className="block mt-1 text-sm text-gold font-bold">
                                                {getDisplayPrice(product).toFixed(2).replace('.', ',')} €
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>
            )}

            {/* Trade angle — this is what turns "café Lavazza" into
                "grossiste café Lavazza". */}
            <section className="py-14 px-4 sm:px-8">
                <div className="max-w-[900px] mx-auto">
                    <h2 className="font-display text-3xl uppercase tracking-tight mb-6">
                        {en
                            ? `${brand.name} for businesses`
                            : `${brand.name} pour les professionnels`}
                    </h2>
                    <p className="text-sand/70 text-lg leading-relaxed mb-5">
                        {en
                            ? `As a wholesaler, Cafrezzo supplies ${brand.name} to cafés, restaurants, hotels, bars, coffee shops, offices and companies. Trade pricing is tiered by quantity, and coffee can be ordered alongside the machine to brew it.`
                            : `En tant que grossiste, Cafrezzo fournit ${brand.name} aux cafés, restaurants, hôtels, bars, coffee shops, bureaux et entreprises. Les tarifs professionnels sont dégressifs selon les quantités, et le café peut être commandé avec la machine qui le prépare.`}
                    </p>
                    <div className="flex flex-wrap gap-6">
                        <Link
                            href={localePath(locale, '/professionnels')}
                            className="text-gold font-bold text-sm uppercase tracking-widest hover:underline"
                        >
                            {en ? 'Wholesale coffee offer' : 'Notre offre grossiste'}
                        </Link>
                        <Link
                            href={localePath(locale, '/contact')}
                            className="text-gold font-bold text-sm uppercase tracking-widest hover:underline"
                        >
                            {en ? 'Request a trade quote' : 'Demander une offre professionnelle'}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-14 px-4 sm:px-8">
                <div className="max-w-[900px] mx-auto">
                    <h2 className="font-display text-3xl uppercase tracking-tight mb-10">
                        {en ? 'Frequently asked questions' : 'Questions fréquentes'}
                    </h2>
                    <div className="space-y-10">
                        {faqs.map(faq => (
                            <div key={faq.question}>
                                <h3 className="font-display text-xl uppercase tracking-tight text-sand mb-3">
                                    {faq.question}
                                </h3>
                                <p className="text-sand/70 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <RelatedLinks
                locale={locale}
                heading={en ? 'Related pages' : 'Aller plus loin'}
                links={[
                    {
                        href: '/marques',
                        label: en ? 'All coffee brands' : 'Toutes les marques de café',
                        hint: en
                            ? 'Every brand Cafrezzo distributes.'
                            : 'Toutes les marques distribuées par Cafrezzo.',
                    },
                    {
                        href: '/professionnels',
                        label: en
                            ? 'Coffee wholesale for businesses'
                            : 'Grossiste café pour professionnels',
                        hint: en
                            ? 'Coffee and machines for cafés, restaurants, hotels and offices.'
                            : 'Café et machines pour cafés, restaurants, hôtels et bureaux.',
                    },
                    {
                        href: '/shop',
                        label: en ? 'Buy coffee online' : 'Acheter du café en ligne',
                        hint: en
                            ? 'Beans, ground coffee, capsules and teas.'
                            : 'Cafés en grains, moulus, capsules et thés.',
                    },
                ]}
            />
        </div>
    );
}
