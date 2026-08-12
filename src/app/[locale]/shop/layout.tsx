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
        title: 'Boutique — Cafés, Capsules & Machines',
        description: 'Parcourez tout le catalogue Cafrezzo : cafés en grains, moulus, capsules compatibles, machines et gourmandises. Livraison offerte dès 150€.',
        path: '/shop',
    });
}

// Metadata-only layout. No BreadcrumbList: this layout also wraps a dynamic
// child route which emits its own richer trail, and two competing trails on one
// URL let Google pick the weaker one.
export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
