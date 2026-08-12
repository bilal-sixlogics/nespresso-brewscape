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
        title: 'Notifications',
        description: 'Notifications — Cafrezzo.',
        path: '/notifications',
        noindex: true,
    });
}

// Metadata-only layout. Transactional route: explicitly noindex so it cannot be
// indexed via an external link, which robots.txt alone does not prevent.
export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
