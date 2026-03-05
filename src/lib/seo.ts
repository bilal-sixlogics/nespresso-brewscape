import { Metadata } from 'next';

const BASE_URL = 'https://cafrezzo.com';

/**
 * Shared base Open Graph metadata used on every page.
 * Override specific fields in each page's own metadata export.
 */
export const baseMetadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: 'Cafrezzo | Premium French Coffee',
        template: '%s | Cafrezzo',
    },
    description:
        'Discover the bold and sophisticated world of Cafrezzo premium coffee. Shop capsules, beans, machines & gourmet sweets — shipped from France.',
    keywords: [
        'premium coffee', 'café français', 'nespresso compatible', 'coffee capsules',
        'coffee machines', 'café en grain', 'cafrezzo', 'café en ligne', 'livraison france',
        'lavazza', 'delta cafes', 'specialty coffee',
    ],
    authors: [{ name: 'Cafrezzo', url: BASE_URL }],
    creator: 'Cafrezzo',
    publisher: 'Cafrezzo',
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        alternateLocale: 'en_GB',
        url: BASE_URL,
        siteName: 'Cafrezzo',
        title: 'Cafrezzo | Premium French Coffee',
        description:
            'Discover the bold and sophisticated world of Cafrezzo premium coffee. Shop capsules, beans, machines & gourmet sweets.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Cafrezzo — Premium Coffee Experience',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cafrezzo | Premium French Coffee',
        description: 'Shop premium coffee capsules, beans, machines & gourmet sweets — shipped from France.',
        images: ['/og-image.png'],
        creator: '@cafrezzo',
        site: '@cafrezzo',
    },
    alternates: {
        canonical: BASE_URL,
        languages: {
            'fr-FR': BASE_URL,
            'en-GB': `${BASE_URL}/en`,
        },
    },
    verification: {
        // Replace with your actual verification codes when deploying
        google: 'REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN',
    },
};

/**
 * Generates product-specific Open Graph metadata for PDP pages.
 */
export function generateProductMetadata(product: {
    name: string;
    nameEn?: string;
    description?: string;
    slug: string;
    image: string;
    price: number;
    category?: string;
}): Metadata {
    const title = product.nameEn ?? product.name;
    const description =
        product.description?.slice(0, 155) ??
        `Buy ${title} — premium coffee from Cafrezzo. Free shipping on orders over €150.`;
    const url = `${BASE_URL}/shop/${product.slug}`;

    return {
        title,
        description,
        openGraph: {
            type: 'website',
            url,
            title,
            description,
            images: [{ url: product.image, width: 800, height: 800, alt: title }],
        },
        twitter: { card: 'summary_large_image', title, description, images: [product.image] },
        alternates: { canonical: url },
    };
}

/**
 * JSON-LD structured data for the homepage (Organization + WebSite schema).
 */
export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cafrezzo',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+33-1-39-85-85-65',
        contactType: 'customer service',
        areaServed: ['FR', 'BE', 'CH', 'LU'],
        availableLanguage: ['French', 'English'],
    },
    sameAs: [
        'https://www.instagram.com/cafrezzo',
        'https://www.facebook.com/cafrezzo',
        'https://twitter.com/cafrezzo',
    ],
};

export const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cafrezzo',
    url: BASE_URL,
    potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/shop?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
    },
};

/**
 * JSON-LD product schema for PDP pages.
 */
export function generateProductSchema(product: {
    name: string;
    description?: string;
    slug: string;
    image: string;
    price: number;
    inStock?: boolean;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description ?? '',
        image: product.image,
        url: `${BASE_URL}/shop/${product.slug}`,
        brand: { '@type': 'Brand', name: 'Cafrezzo' },
        offers: {
            '@type': 'Offer',
            url: `${BASE_URL}/shop/${product.slug}`,
            priceCurrency: 'EUR',
            price: product.price.toFixed(2),
            availability: product.inStock !== false
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: 'Cafrezzo' },
        },
    };
}

/**
 * JSON-LD BreadcrumbList schema for product and category pages.
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${BASE_URL}${item.url}`,
        })),
    };
}
