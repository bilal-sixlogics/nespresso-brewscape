import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const locale = toLocale((await params).locale);
    return pageMetadata({
        locale,
        title: 'Journal',
        description: 'Actualités, conseils et histoires autour du café par Cafrezzo — origines, préparation et culture du café.',
        path: '/blog',
        titleKey: 'blogTitle',
        descriptionKey: 'blogSubtitle',
    });
}

// Metadata-only layout. No BreadcrumbList: this layout also wraps a dynamic
// child route which emits its own richer trail, and two competing trails on one
// URL let Google pick the weaker one.
export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
