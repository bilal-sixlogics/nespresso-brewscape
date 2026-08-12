import type { Metadata } from 'next';

// Order detail pages are per-customer and must never be indexed. robots.txt
// disallows /orders/, but a disallowed URL can still be indexed if linked
// externally — only a noindex tag prevents that, and it applies to every
// nested route under /orders.
export const metadata: Metadata = {
    title: 'Ma Commande',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
