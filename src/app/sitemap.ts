import { MetadataRoute } from 'next';
import { enrichedProducts } from '@/lib/productsData';
import { AppConfig } from '@/lib/config';

const BASE_URL = `https://${AppConfig.brand.domain}`;

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Static pages
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/machines`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/accessories`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/sweets`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${BASE_URL}/brew-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/shipping`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
        { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ];

    // Dynamic product pages
    const productRoutes: MetadataRoute.Sitemap = enrichedProducts
        .filter(p => p.slug)
        .map(p => ({
            url: `${BASE_URL}/shop/${p.slug}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.85,
        }));

    return [...staticRoutes, ...productRoutes];
}
