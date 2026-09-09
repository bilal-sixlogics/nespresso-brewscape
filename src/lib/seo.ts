import { Metadata } from 'next';

import { AppConfig } from './config';

import {
    DEFAULT_LOCALE,
    LOCALES,
    LOCALE_META,
    localePath,
    type Locale,
} from './i18n';
import { translations, type TranslationKey } from './translations';

/**
 * Canonical origin for every absolute URL the site emits — metadataBase,
 * canonicals, hreflang, robots.txt and the sitemap all read from here.
 *
 * Single source of truth on purpose: this was redeclared in robots.ts,
 * sitemap.ts and shop/page.tsx, so changing the domain would have updated
 * some canonicals and left the others advertising the old host.
 */
export const SITE_URL = `https://${AppConfig.brand.domain}`;

const BASE_URL = SITE_URL;
const SITE_NAME = 'Cafrezzo';
const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/** Absolute URL for a path within a locale. */
function absoluteUrl(locale: Locale, path: string): string {
    return `${BASE_URL}${localePath(locale, path)}`;
}

/**
 * hreflang map for a path across every locale, plus x-default.
 *
 * Every localised page must carry this. Without it Google sees five URLs with
 * near-identical structure and no statement that they are translations of one
 * another, which reads as duplication rather than internationalisation.
 */
function hreflangAlternates(path: string): Record<string, string> {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) {
        languages[LOCALE_META[locale].hreflang] = absoluteUrl(locale, path);
    }
    // Visitors whose language we do not publish get the French original.
    languages['x-default'] = absoluteUrl(DEFAULT_LOCALE, path);
    return languages;
}

/**
 * Resolves a translation key for a locale, falling back to French.
 *
 * Used so page titles reuse copy that is already professionally translated in
 * all five languages, rather than machine-translated SEO strings.
 */
/**
 * Rejoins a heading the page renders across two lines.
 *
 * German and Dutch split compound nouns with a trailing hyphen
 * ("Datenschutz-" / "erklärung"). That hyphen is a typographic line-break
 * device, not part of the word: the correct single-line forms are
 * "Datenschutzerklärung" and "Privacybeleid", so it is dropped on join.
 * A naive space join would emit "Datenschutz- erklärung".
 */
function joinHeading(line1: string, line2: string): string {
    if (!line2) return line1;
    return line1.endsWith('-') ? `${line1.slice(0, -1)}${line2}` : `${line1} ${line2}`;
}

function tr(locale: Locale, key: string, fallback: string): string {
    const dict = translations[locale] as Record<string, string> | undefined;
    const fr = translations[DEFAULT_LOCALE] as Record<string, string>;
    return dict?.[key] ?? fr?.[key] ?? fallback;
}

export type { TranslationKey };

// Social / AI link-preview image.
// TODO(design): replace with a purpose-built 1200x630 og-image.png. This points
// at an existing catalogue photo so previews resolve at all — the previous
// /og-image.png was never added to /public and returned 404 on every share.
const OG_IMAGE = '/coffee-beans.jpg';

// Organization logo for structured data. The previous /logo.png did not exist.
const LOGO_URL = `${BASE_URL}/assets/logo.svg`;

// Shared by Organization and Store so the two can never drift apart.
const POSTAL_ADDRESS = {
    '@type': 'PostalAddress',
    streetAddress: "30 rue de l'Escouvrier",
    postalCode: '95200',
    addressLocality: 'Gonesse',
    addressRegion: 'Île-de-France',
    addressCountry: 'FR',
} as const;

/** Home title/description per locale — the only strings not already in the dictionary. */
const HOME_SEO: Record<Locale, { title: string; description: string }> = {
    fr: {
        title: 'Cafrezzo | Café en Grains, Capsules & Machines à Café',
        description:
            'Cafrezzo : café en grains, café moulu, capsules et machines à café pour particuliers et professionnels. Découvrez notre sélection et commandez en ligne.',
    },
    en: {
        title: 'Cafrezzo | Coffee Beans, Capsules & Coffee Machines',
        description:
            'Cafrezzo: coffee beans, ground coffee, capsules and coffee machines for home and business. Browse our selection and order online.',
    },
    de: {
        title: 'Cafrezzo | Kaffee, Kapseln & Maschinen',
        description:
            'Willkommen in der Welt von Cafrezzo, wo jede Tasse eine Geschichte von Leidenschaft und Qualität erzählt. Entdecken Sie unsere exklusive Auswahl.',
    },
    ru: {
        title: 'Cafrezzo | Кофе, капсулы и кофемашины',
        description:
            'Добро пожаловать в мир Cafrezzo, где каждая чашка рассказывает историю страсти и качества. Откройте для себя наш эксклюзивный выбор кофе и машин.',
    },
    nl: {
        title: 'Cafrezzo | Koffie, Capsules & Machines',
        description:
            'Welkom in de wereld van Cafrezzo, waar elke kop een verhaal van passie en kwaliteit vertelt. Ontdek onze exclusieve selectie koffie en machines.',
    },
};

/**
 * Base metadata for a locale. Applied by app/[locale]/layout.tsx.
 *
 * Deliberately a function of the locale: the previous constant hardcoded
 * French, so the four other languages advertised French titles and og:locale.
 */
export function buildBaseMetadata(locale: Locale): Metadata {
    const home = HOME_SEO[locale];
    const meta = LOCALE_META[locale];

    return {
        ...baseMetadataShared,
        title: { default: home.title, template: TITLE_TEMPLATE },
        description: home.description,
        openGraph: {
            ...(baseMetadataShared.openGraph as object),
            locale: meta.ogLocale,
            alternateLocale: LOCALES.filter(l => l !== locale).map(l => LOCALE_META[l].ogLocale),
            url: absoluteUrl(locale, '/'),
            title: home.title,
            description: home.description,
        },
        twitter: {
            ...(baseMetadataShared.twitter as object),
            title: home.title,
            description: home.description,
        },
        alternates: {
            canonical: absoluteUrl(locale, '/'),
            languages: hreflangAlternates('/'),
        },
    };
}

/** Fields identical across locales. */
const baseMetadataShared: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: 'Cafrezzo | Intensément Café',
        template: TITLE_TEMPLATE,
    },
    description:
        'Bienvenue dans l’univers Cafrezzo, où chaque tasse raconte une histoire de passion et de qualité. Découvrez notre sélection exclusive',
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
        // `max-snippet: -1` lifts the default cap on how much text may be
        // quoted — it governs both rich snippets and how much an AI answer
        // engine is permitted to reproduce, so it matters for citation.
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        alternateLocale: 'en_GB',
        url: BASE_URL,
        siteName: 'Cafrezzo',
        title: 'Cafrezzo | Intensément Café',
        description:
            'Bienvenue dans l’univers Cafrezzo, où chaque tasse raconte une histoire de passion et de qualité. Découvrez notre sélection exclusive',
        images: [
            {
                url: OG_IMAGE,
                width: 1024,
                height: 1024,
                alt: 'Cafrezzo — Votre expérience café',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cafrezzo | Intensément Café',
        description:
            'Bienvenue dans l’univers Cafrezzo, où chaque tasse raconte une histoire de passion et de qualité. Découvrez notre sélection exclusive',
        images: [OG_IMAGE],
        // No `creator` / `site`: twitter.com/cafrezzo returns 404 and Cafrezzo
        // has no X account in the admin social settings. Declaring a handle
        // that does not exist gains nothing and misattributes the card.
    },
    // `alternates` is set per locale by buildBaseMetadata() and per page by
    // pageMetadata(). It must never be a static constant here: a canonical on
    // the root layout is inherited by every page that does not override it,
    // which previously made all routes declare themselves duplicates of the
    // homepage.
    verification: {
        google: 'cs7eUJ0hscfT6OXq6cH4MASeGmq6llEFkpYlTGeNToE',
    },
};

/**
 * Per-page metadata for static routes.
 *
 * Every indexable page must call this so it declares its own canonical URL.
 * Without it a page inherits the root metadata and is indistinguishable from
 * the homepage in search results.
 *
 * @param path Route path beginning with a slash, e.g. '/shop'. Use '/' for home.
 */
export function pageMetadata(opts: {
    /** Locale from the [locale] route segment. */
    locale: Locale;
    /** Literal title, used when no translation key is supplied or found. */
    title: string;
    description: string;
    /** Locale-free route path, e.g. '/shop'. The locale prefix is added here. */
    path: string;
    /**
     * Translation keys for copy that already exists in all five languages.
     * Preferred over the literal `title`/`description`, which are French.
     */
    titleKey?: string;
    /**
     * Second half of a title that the page renders as a two-line heading
     * (e.g. faqPageHeadingLine1 "Questions" + Line2 "Fréquentes"). Joined with
     * a space — without it the title is a meaningless fragment like "Häufig".
     */
    titleKey2?: string;
    descriptionKey?: string;
    image?: string;
    noindex?: boolean;
    /**
     * Bypass the root `'%s | Cafrezzo'` title template. Needed when the title
     * already contains the brand — otherwise it renders twice
     * ("Cafrezzo | Intensément Café | Cafrezzo").
     */
    absoluteTitle?: boolean;
}): Metadata {
    const {
        locale,
        path,
        image = OG_IMAGE,
        noindex = false,
        absoluteTitle = false,
        titleKey,
        titleKey2,
        descriptionKey,
    } = opts;

    const title = titleKey ? joinHeading(tr(locale, titleKey, opts.title), titleKey2 ? tr(locale, titleKey2, '') : '') : opts.title;
    const description = descriptionKey
        ? tr(locale, descriptionKey, opts.description)
        : opts.description;

    const url = absoluteUrl(locale, path);

    // Emit `{ absolute, template }` rather than a bare string.
    //
    // `absolute` sets this segment's own title and opts out of the parent's
    // template, so the brand suffix is not appended twice. `template` is then
    // re-declared for nested routes — without it, a layout title would wipe the
    // root '%s | Cafrezzo' template and leave /shop/[slug] and /journal/[slug] with
    // no brand suffix at all.
    const ownTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

    return {
        title: { absolute: ownTitle, template: TITLE_TEMPLATE },
        description,
        openGraph: {
            type: 'website',
            url,
            siteName: 'Cafrezzo',
            locale: LOCALE_META[locale].ogLocale,
            title,
            description,
            images: [{ url: image, alt: title }],
        },
        twitter: { card: 'summary_large_image', title, description, images: [image] },
        alternates: {
            canonical: url,
            // Omitted for noindex routes: declaring translation alternates for a
            // page you are asking Google not to index is a contradiction.
            ...(noindex ? {} : { languages: hreflangAlternates(path) }),
        },
        ...(noindex ? { robots: { index: false, follow: true } } : {}),
    };
}

/**
 * Generates product-specific Open Graph metadata for PDP pages.
 */
export function generateProductMetadata(product: {
    locale: Locale;
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
    const path = `/shop/${product.slug}`;
    const url = absoluteUrl(product.locale, path);

    return {
        title,
        description,
        openGraph: {
            type: 'website',
            url,
            locale: LOCALE_META[product.locale].ogLocale,
            title,
            description,
            images: [{ url: product.image, width: 800, height: 800, alt: title }],
        },
        twitter: { card: 'summary_large_image', title, description, images: [product.image] },
        // The same product exists under every locale — declare them as
        // translations of one another rather than five near-duplicate pages.
        alternates: { canonical: url, languages: hreflangAlternates(path) },
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
    logo: LOGO_URL,
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+33-1-39-85-85-65',
        contactType: 'customer service',
        areaServed: ['FR', 'BE', 'CH', 'LU'],
        // Derived from LOCALES so it cannot drift out of sync. This
        // previously named only French and English, while the site has
        // published five languages since the locale routing landed.
        availableLanguage: LOCALES.map(l => LOCALE_META[l].hreflang),
    },
    // Confirmed profile URLs. Getting these wrong breaks entity resolution —
    // Google cannot tie the site to the accounts — so only add a URL that has
    // been resolved, never one inferred from a handle.
    //
    // Facebook: the numeric profile ID is the stable canonical form. The
    // /share/<id>/ link redirects here, and the /people/<name>/pfbid.../ form
    // it lands on carries a pfbid that rotates. Tracking params (mibextid,
    // igsh, rdid) are stripped — they identify a referral, not the profile.
    //
    // Note the earlier value here was facebook.com/cafrezzo.officiel, guessed
    // from the malformed `social_facebook_url` admin setting. It is a different
    // page from the real one below.
    sameAs: [
        'https://www.facebook.com/profile.php?id=61590643285101',
        'https://www.instagram.com/cafrezzo_officiel/',
        'https://www.tiktok.com/@cafrezzo_officiel',
        'https://www.linkedin.com/in/boutique-cafrezzo-66705a413/',
    ],
    description:
        'Torréfacteur et distributeur de café en ligne : cafés en grains, moulus, capsules compatibles, machines à café, thés et accessoires. Boutique à Gonesse, livraison en France, Belgique, Luxembourg et Suisse.',
    // Countries we actually ship to, per the FAQ and delivery terms.
    areaServed: ['FR', 'BE', 'LU', 'CH'],
    // French business identifiers — strong entity signals for a FR retailer.
    vatID: 'FR17102596061',
    taxID: '102 596 061 00014',
    email: 'boutique@cafrezzo.com',
    address: POSTAL_ADDRESS,
};

/**
 * JSON-LD for the physical shop.
 *
 * Distinct from `organizationSchema`: that identifies the business entity,
 * this describes a visitable location and is what drives local/map results
 * for queries like "café Gonesse". Belongs on the pages that describe the
 * shop itself (/contact, /visit-shop), not sitewide.
 *
 * `geo` is deliberately absent — we have no verified coordinates, and Google
 * treats it as recommended, not required. Add it once the lat/long is known.
 */
export const storeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${BASE_URL}/#store`,
    name: 'Cafrezzo',
    url: `${BASE_URL}/visit-shop`,
    image: `${BASE_URL}${OG_IMAGE}`,
    logo: LOGO_URL,
    telephone: '+33-1-39-85-85-65',
    email: 'boutique@cafrezzo.com',
    address: POSTAL_ADDRESS,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    parentOrganization: { '@type': 'Organization', name: 'Cafrezzo', url: BASE_URL },
    openingHoursSpecification: [
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '17:00',
        },
    ],
};

/**
 * WebSite schema for one locale.
 *
 * A function rather than a constant because `inLanguage` has to match the
 * page it is emitted on. As a constant it hardcoded 'fr-FR', so /en, /de,
 * /ru and /nl each told Google they were French — the identical defect that
 * buildBaseMetadata() was turned into a function to fix, left behind in the
 * schema layer. generateArticleSchema() already derives it this way.
 */
export function buildWebsiteSchema(locale: Locale) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Cafrezzo',
        url: BASE_URL,
        inLanguage: LOCALE_META[locale].hreflang,
        publisher: { '@type': 'Organization', name: 'Cafrezzo', url: BASE_URL },
        // NOTE: no `potentialAction` / SearchAction.
        // It previously declared `/shop?q={search_term_string}`, but /shop only
        // reads the `category` and `brand` query params — `q` is ignored, so the
        // sitelinks search box would have dropped users on unfiltered results.
        // To restore it, make /shop honour a `q` param, then re-add the action.
    };
}

/**
 * JSON-LD product schema for PDP pages.
 */
export function generateProductSchema(product: {
    locale: Locale;
    name: string;
    description?: string;
    slug: string;
    image: string;
    price: number;
    inStock?: boolean;
    sku?: string;
    ratingValue?: number | null;
    reviewCount?: number | null;
}) {
    const url = absoluteUrl(product.locale, `/shop/${product.slug}`);

    // Only emit aggregateRating when there is a genuine rating behind it.
    // Inventing or defaulting ratings breaks Google's structured-data policy
    // and risks a manual action. Today almost no product has reviews, so this
    // is usually absent — it starts appearing on its own as reviews accrue.
    const hasRating =
        typeof product.ratingValue === 'number' &&
        product.ratingValue > 0 &&
        typeof product.reviewCount === 'number' &&
        product.reviewCount > 0;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description ?? '',
        image: product.image,
        url,
        ...(product.sku ? { sku: product.sku } : {}),
        brand: { '@type': 'Brand', name: 'Cafrezzo' },
        ...(hasRating
            ? {
                  aggregateRating: {
                      '@type': 'AggregateRating',
                      ratingValue: product.ratingValue,
                      reviewCount: product.reviewCount,
                  },
              }
            : {}),
        offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'EUR',
            price: product.price.toFixed(2),
            itemCondition: 'https://schema.org/NewCondition',
            availability: product.inStock !== false
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: 'Cafrezzo', url: BASE_URL },
        },
    };
}

/**
 * JSON-LD Article schema for blog posts.
 *
 * Articles are the content most likely to be quoted by an AI assistant, so the
 * author, dates and publisher are worth stating explicitly.
 */
export function generateArticleSchema(post: {
    locale: Locale;
    title: string;
    description?: string;
    slug: string;
    image?: string;
    author?: string;
    publishedAt?: string;
    updatedAt?: string;
}) {
    const url = absoluteUrl(post.locale, `/journal/${post.slug}`);
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description ?? '',
        image: post.image ? [post.image] : undefined,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: { '@type': post.author ? 'Person' : 'Organization', name: post.author ?? 'Cafrezzo' },
        publisher: {
            '@type': 'Organization',
            name: 'Cafrezzo',
            logo: { '@type': 'ImageObject', url: LOGO_URL },
        },
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        inLanguage: LOCALE_META[post.locale].hreflang,
    };
}

/**
 * JSON-LD FAQPage schema.
 *
 * The highest-value schema for answer engines: it maps a question directly to
 * its answer, which is exactly the unit an assistant needs to cite.
 */
export function generateFaqSchema(items: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
    };
}

/**
 * JSON-LD BreadcrumbList schema for product and category pages.
 *
 * `items[].url` is a locale-free path ('/shop'); the locale prefix is applied
 * here so a breadcrumb never points a German page at the French URL.
 */
export function generateBreadcrumbSchema(
    locale: Locale,
    items: { name: string; url: string }[],
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: absoluteUrl(locale, item.url),
        })),
    };
}
