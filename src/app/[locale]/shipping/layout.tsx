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
    return pageMetadata({
        locale,
        title: 'Livraison & Retours',
        description: 'Délais, tarifs et conditions de livraison Cafrezzo. Livraison offerte dès 150€ d’achat en France.',
        path: '/shipping',
        titleKey: 'shippingPageHeadingLine1',
        titleKey2: 'shippingPageHeadingLine2',
        descriptionKey: 'shippingMetaDescription',
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
                    { name: 'Livraison & Retours', url: '/shipping' },
                ])}
            />
            {children}
        </>
    );
}
