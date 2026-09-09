import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema, pageMetadata, storeSchema } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const locale = toLocale((await params).locale);
    return pageMetadata({
        locale,
        title: 'Visiter la Boutique',
        description: 'Venez découvrir la boutique Cafrezzo à Gonesse — dégustation, conseils et sélection complète de cafés et machines.',
        path: '/visit-shop',
        titleKey: 'visitShopTitle',
        descriptionKey: 'visitShopSubtitle',
    });
}

// Metadata-only layout. This page and /contact both describe the physical shop,
// so both carry the same Store node — the shared '@id' tells crawlers it is one
// location, not two. Renders no visible markup of its own.
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
                schema={[
                    storeSchema,
                    generateBreadcrumbSchema(locale, [
                        { name: 'Accueil', url: '/' },
                        { name: 'Visiter la Boutique', url: '/visit-shop' },
                    ]),
                ]}
            />
            {children}
        </>
    );
}
