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
        title: 'Contact & Boutiques',
        description: 'Contactez Cafrezzo : boutique de Gonesse, téléphone, email et horaires d’ouverture. Réponse sous 24 heures ouvrables.',
        path: '/contact',
        titleKey: 'contactTitle',
        descriptionKey: 'contactMetaDescription',
    });
}

// Metadata-only layout: title, description, canonical, hreflang, plus Store
// structured data for the physical shop. Renders no visible markup of its own.
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
                        { name: 'Contact & Boutiques', url: '/contact' },
                    ]),
                ]}
            />
            {children}
        </>
    );
}
