import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/account', '/checkout', '/order-success', '/order-failed', '/api/'],
            },
            {
                // Block AI crawlers from training on product data
                userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai'],
                disallow: '/',
            },
        ],
        sitemap: 'https://cafrezzo.com/sitemap.xml',
        host: 'https://cafrezzo.com',
    };
}
