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
        title: 'Retours & Remboursements',
        description: 'Conditions de retour et de remboursement des commandes Cafrezzo — délais, procédure et prise en charge.',
        path: '/returns',
        titleKey: 'returnsMetaTitle',
        descriptionKey: 'returnsMetaDescription',
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
                    { name: 'Retours & Remboursements', url: '/returns' },
                ])}
            />
            {children}
        </>
    );
}
