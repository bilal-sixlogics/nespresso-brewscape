import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema, pageMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const locale = toLocale((await params).locale);
    // French gets commercial copy written for the queries this page actually
    // competes on — "machine à café professionnelle", "grossiste machine à
    // café", "achat machine à café", plus the Paris / Île-de-France modifiers.
    // The old title was the bare hero string "Machines à Café", which matched
    // no commercial intent and read identically to the H1.
    //
    // The other four locales keep the translated keys, which are correct for
    // them; only French is being targeted here.
    //
    // Revised 14 Oct 2026. The previous title, "Machines à Café
    // Professionnelles — Grossiste", was the union of the two machine landing
    // pages' titles (/machine-a-cafe-professionnelle, /grossiste-machines-a-cafe),
    // so three URLs asked to rank for one query. This page is the catalogue:
    // it now claims the purchase intent ("achat machine à café", 9 impressions
    // at position 4.3 in the 3-month export) and leaves advice and trade supply
    // to the landing pages. The description also promised bean-to-cup and
    // automatic machines; every machine the catalogue lists is a capsule
    // machine (Lavazza BLUE, A Modo Mio, Delta Q), and it ran to 226
    // characters. Revisit if non-capsule machines are added to the catalogue.
    if (locale === 'fr') {
        return pageMetadata({
            locale,
            title: 'Acheter une Machine à Café : Lavazza, Delta Q',
            description:
                'Machines à café à capsules Lavazza BLUE, A Modo Mio et Delta Q pour le bureau, le commerce ou la maison. Prix affichés, livraison offerte dès 150 €.',
            path: '/machines',
        });
    }

    return pageMetadata({
        locale,
        title: 'Machines à Café',
        description: 'Machines à café expresso, à capsules et automatiques sélectionnées par Cafrezzo. Marques premium, livraison offerte dès 150€.',
        path: '/machines',
        descriptionKey: 'machinesMetaDescription',
        titleKey: 'machinesHeroTitle',
    });
}

// Metadata-only layout: title, description, canonical, hreflang and breadcrumb
// structured data. Renders no visible markup of its own.
export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const locale = toLocale((await params).locale);
    return (
        <>
            <JsonLd
                schema={generateBreadcrumbSchema(locale, [
                    { name: 'Accueil', url: '/' },
                    { name: 'Machines', url: '/machines' },
                ])}
            />
            {children}
        </>
    );
}
