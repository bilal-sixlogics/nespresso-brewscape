import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/i18n';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const locale = toLocale((await params).locale);

    // French is where the journal's articles are, and most of them are now
    // trade guides; "Le Journal" alone told a searcher nothing about either.
    if (locale === 'fr') {
        return pageMetadata({
            locale,
            title: 'Journal : guides café pour pros et amateurs',
            description:
                'Guides pour cafés, restaurants et bureaux : choisir un fournisseur, calculer le coût par tasse, budgéter sa machine. Conseils café de Cafrezzo.',
            path: '/journal',
        });
    }

    return pageMetadata({
        locale,
        title: 'Journal',
        description: 'Actualités, conseils et histoires autour du café par Cafrezzo — origines, préparation et culture du café.',
        path: '/journal',
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
