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
        title: 'Nos Origines',
        description: 'L’histoire de Cafrezzo et les origines de nos cafés — terroirs, producteurs et méthodes de torréfaction.',
        path: '/our-origins',
        titleKey: 'ourOriginsMetaTitle',
        descriptionKey: 'ourOriginsMetaDescription',
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
                    { name: 'Nos Origines', url: '/our-origins' },
                ])}
            />
            {children}
        </>
    );
}
