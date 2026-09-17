// Server-rendered internal link hub for the homepage.
//
// Why this is a Server Component and not part of HomePageClient:
//
// The homepage's brand tiles are fetched in a useEffect inside
// BrandsShowcaseSection, so the <a href="/marques/..."> elements do not exist
// in the HTML the server sends. A crawler that does not execute the page's
// JavaScript — which includes most AI retrieval bots, and Googlebot on its
// first pass — sees an empty brand strip. Those links therefore pass no
// authority to the brand pages they point at.
//
// This block renders the same destinations as plain <a> elements in the
// initial HTML. It is additive: the interactive tiles stay exactly as they
// are, and nothing above is restyled.
//
// The homepage holds most of the site's inbound authority, and until now
// spent it almost entirely on retail product routes. These links redirect
// part of it onto the commercial B2B pages, using the French phrases those
// pages are actually built to rank for as the visible anchor text.
import Link from 'next/link';

import { getBrands } from '@/lib/api/server';
import { localePath, type Locale } from '@/lib/i18n';

/**
 * B2B destinations, with the anchor text they should be linked by.
 *
 * The anchor is the searched phrase rather than a UI label ("En savoir
 * plus"), because anchor text is one of the few on-page signals that says
 * what the *destination* is about rather than what the current page is
 * about. Kept to real pages only — an exact-match anchor pointing at a URL
 * that does not exist is worse than no link.
 */
const B2B_LINKS: { href: string; anchor: string; hint: string }[] = [
    {
        href: '/grossiste-cafe-paris',
        anchor: 'Grossiste café Paris',
        hint: 'Fournisseur des cafés, restaurants et hôtels parisiens.',
    },
    {
        href: '/professionnels',
        anchor: 'Fournisseur café professionnel',
        hint: 'Conditions professionnelles, tarifs dégressifs, achat au carton et à la palette.',
    },
    {
        href: '/grossiste-cafe-ile-de-france',
        anchor: 'Grossiste café en grain Île-de-France',
        hint: 'Notre couverture régionale, département par département.',
    },
    {
        href: '/grossiste-cafe-val-d-oise',
        anchor: 'Grossiste café Val-d’Oise (95)',
        hint: 'Notre département : boutique à Gonesse et retrait des commandes.',
    },
    {
        href: '/grossiste-cafe-seine-saint-denis',
        anchor: 'Grossiste café Seine-Saint-Denis (93)',
        hint: 'Volumes irréguliers et réassorts d’appoint.',
    },
    {
        href: '/grossiste-cafe-hauts-de-seine',
        anchor: 'Café pour entreprise Hauts-de-Seine (92)',
        hint: 'Espaces de pause, sièges sociaux et campus tertiaires.',
    },
    {
        href: '/grossiste-cafe-seine-et-marne',
        anchor: 'Grossiste café Seine-et-Marne (77)',
        hint: 'Livraisons planifiées sur un département étendu.',
    },
    {
        href: '/grossiste-machines-a-cafe',
        anchor: 'Grossiste machines à café',
        hint: 'Machines à grains, automatiques et à capsules pour un usage intensif.',
    },
];

export async function HomeLinkHub({ locale }: { locale: Locale }) {
    // Both sections below are French-market commercial pages. Rendering them
    // into /de, /ru or /nl would publish links to pages those locales 404 on.
    const isFr = locale === 'fr';
    const isFrOrEn = locale === 'fr' || locale === 'en';
    if (!isFrOrEn) return null;

    const brands = (await getBrands())
        .filter(b => b.slug && b.name && b.status !== 'inactive')
        .slice(0, 12);

    return (
        <section
            id="solutions-professionnels"
            className="bg-ink border-t border-sand/10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 grain-overlay relative overflow-hidden"
        >
            <div className="max-w-[1100px] mx-auto relative z-10">
                {isFr && (
                    <>
                        <h2 className="font-display text-3xl sm:text-4xl text-sand uppercase tracking-tight leading-[0.95] mb-4">
                            Nos solutions pour les professionnels
                        </h2>
                        <p className="text-sand/70 text-sm sm:text-base leading-relaxed max-w-[800px] mb-10">
                            Cafrezzo est grossiste et fournisseur de café pour les professionnels
                            d’Île-de-France. Café en grains, café moulu, capsules et machines à
                            café, avec achat au carton et à la palette et tarifs dégressifs selon
                            les quantités commandées.
                        </p>

                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 mb-16 list-none p-0">
                            {B2B_LINKS.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={localePath(locale, link.href)}
                                        className="text-gold font-bold text-xs uppercase tracking-widest hover:underline"
                                    >
                                        {link.anchor}
                                    </Link>
                                    <p className="text-sand/55 text-xs leading-relaxed mt-2">
                                        {link.hint}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {/* Plain-text, server-rendered counterpart to the interactive
                    logo strip further up the page. */}
                {brands.length > 0 && (
                    <div id="marques-partenaires">
                        <h2 className="font-display text-2xl sm:text-3xl text-sand uppercase tracking-tight leading-[0.95] mb-4">
                            {isFr ? 'Marques distribuées' : 'Brands we distribute'}
                        </h2>
                        <p className="text-sand/70 text-sm sm:text-base leading-relaxed max-w-[800px] mb-8">
                            {isFr
                                ? 'Nous distribuons les grandes marques de café italiennes, portugaises et françaises, en grains, moulu et en capsules — pour les particuliers comme pour les professionnels.'
                                : 'We distribute the major Italian, Portuguese and French coffee brands — whole bean, ground and capsules — to private customers and businesses alike.'}
                        </p>
                        <ul className="flex flex-wrap gap-x-8 gap-y-4 list-none p-0">
                            {brands.map(brand => (
                                <li key={brand.slug}>
                                    <Link
                                        href={localePath(locale, `/marques/${brand.slug}`)}
                                        className="text-gold font-bold text-xs uppercase tracking-widest hover:underline"
                                    >
                                        {isFr ? `Café ${brand.name}` : `${brand.name} coffee`}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8">
                            <Link
                                href={localePath(locale, '/marques')}
                                className="text-sand/70 text-xs uppercase tracking-widest hover:text-gold hover:underline"
                            >
                                {isFr ? 'Toutes les marques distribuées' : 'All brands we distribute'}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
