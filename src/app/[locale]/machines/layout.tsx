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
    if (locale === 'fr') {
        return pageMetadata({
            locale,
            title: 'Machines à Café Professionnelles — Grossiste',
            description:
                'Machines à café professionnelles : à grains, à capsules et automatiques. Cafrezzo, grossiste et distributeur à Gonesse près de Paris, équipe restaurants, hôtels, bureaux et entreprises en Île-de-France et dans toute la France.',
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
