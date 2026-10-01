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
function hreflangAlternates(
    path: string,
    /**
     * Locales this path is actually published in. Defaults to all of them.
     *
     * Narrowed for the French commercial landing pages (/professionnels,
     * /grossiste-cafe-paris, ...): they exist only in the languages we wrote
     * them in, and advertising a de/ru/nl alternate that 404s is a worse
     * signal than advertising none.
     */
    locales: readonly Locale[] = LOCALES,
): Record<string, string> {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
        languages[LOCALE_META[locale].hreflang] = absoluteUrl(locale, path);
    }
    // Visitors whose language we do not publish get the French original.
    languages['x-default'] = absoluteUrl(
        locales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : locales[0],
        path,
    );
    return languages;
}

// Re-exported so callers that already reach for the metadata helpers do not
// need a second import. Defined in lib/i18n.ts, which is where the question
// "does this route exist in this locale" belongs.
export { FRENCH_ONLY, FR_EN } from './i18n';

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

// Social / AI link-preview image: 1200x630, the ratio Facebook, LinkedIn,
// Slack, WhatsApp and X all crop to.
//
// Previously this pointed at /coffee-beans.jpg, a 1024x1024 catalogue photo.
// Square art in a 1.91:1 slot gets centre-cropped, so every shared link lost
// the top and bottom third of the image and carried no branding at all.
// Composited from the existing beans photo and the site wordmark over the
// brand ink ground — no new visual language, just the correct canvas.
const OG_IMAGE = '/og-image.jpg';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

// Organization logo for structured data. The previous /logo.png did not exist.
const LOGO_URL = `${BASE_URL}/assets/logo.svg`;

// Shared by Organization and Store so the two can never drift apart.
const POSTAL_ADDRESS = {
    '@type': 'PostalAddress',
    streetAddress: "41 rue d'Aulnay",
    postalCode: '95500',
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
    // Google ignores this tag outright; it is kept only because a couple of
    // smaller engines still read it, and it costs nothing. Re-pointed at the
    // French commercial terms the site actually competes for — it previously
    // listed English phrases and "nespresso compatible", which described a
    // positioning Cafrezzo has moved away from.
    keywords: [
        'grossiste café', 'grossiste café Paris', 'fournisseur café professionnel',
        'distributeur café', 'café CHR', 'grossiste machine à café',
        'machine à café professionnelle', 'café en grains', 'café moulu',
        'capsules café', 'cafrezzo', 'café Lavazza', 'café Delta', 'café Bristot',
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
                width: OG_IMAGE_WIDTH,
                height: OG_IMAGE_HEIGHT,
                alt: 'Cafrezzo — grossiste et distributeur de café, Gonesse (Île-de-France)',
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
        // Both Search Console properties. Next renders one
        // <meta name="google-site-verification"> per entry, and Google accepts
        // any matching token — so keeping both means verifying the second
        // property cannot silently un-verify the first.
        //
        // The matching HTML-file method is also live: the two
        // google*.html tokens live in /public. They were previously sitting in
        // the repo root, which Next does not serve, so both returned 404 and
        // the file method had never actually worked.
        google: [
            'cs7eUJ0hscfT6OXq6cH4MASeGmq6llEFkpYlTGeNToE',
            '0m5l-D9kMSwhAFccBs6j4WSnRc2iQjHznUV_6LDaCag',
        ],
        // Meta Business Manager domain verification (Brand Safety → Domains).
        // Required to configure Aggregated Event Measurement for iOS traffic.
        // The DNS TXT method is preferable — it survives redeploys and needs no
        // rebuild — this env var is the fallback when DNS is not reachable.
        ...(process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION
            ? { other: { 'facebook-domain-verification': process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION } }
            : {}),
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
    /**
     * Locales this page exists in. Defaults to all five. Pass FRENCH_ONLY or
     * FR_EN for pages that are not translated everywhere, so hreflang only
     * names URLs that actually resolve.
     */
    locales?: readonly Locale[];
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
        locales = LOCALES,
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
            ...(noindex ? {} : { languages: hreflangAlternates(path, locales) }),
        },
        ...(noindex ? { robots: { index: false, follow: true } } : {}),
    };
}

/**
 * Generates product-specific Open Graph metadata for PDP pages.
 */
/**
 * Fallback PDP description, per locale.
 *
 * Only reached when the catalogue has neither a `meta_description` nor a
 * product description. It was previously a single hardcoded English sentence,
 * so an untended French product page advertised "Buy … — premium coffee from
 * Cafrezzo" in the French SERP.
 *
 * `{name}` is substituted; the trailing clause states the two facts most
 * likely to earn the click (availability to professionals, free-shipping
 * threshold), both of which are true sitewide.
 */
const PDP_FALLBACK_DESCRIPTION: Record<Locale, (name: string) => string> = {
    fr: name =>
        `${name} — disponible chez Cafrezzo, grossiste et distributeur de café. Vente aux particuliers et aux professionnels, livraison offerte dès 150€.`,
    en: name =>
        `${name} — available from Cafrezzo, coffee wholesaler and distributor. For home and trade customers, free delivery over €150.`,
    de: name =>
        `${name} — erhältlich bei Cafrezzo, Kaffeegroßhändler und Distributor. Für Privat- und Geschäftskunden, Versand ab 150 € kostenlos.`,
    ru: name =>
        `${name} — в наличии в Cafrezzo, оптовом поставщике и дистрибьюторе кофе. Для частных и корпоративных клиентов, бесплатная доставка от 150 €.`,
    nl: name =>
        `${name} — verkrijgbaar bij Cafrezzo, koffiegroothandel en distributeur. Voor particulieren en zakelijke klanten, gratis levering vanaf € 150.`,
};

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
        PDP_FALLBACK_DESCRIPTION[product.locale](title);
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
/** Stable identity for the Organization node, referenced across the graph. */
const ORGANIZATION_ID = `${BASE_URL}/#organization`;

export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    // Without an @id the other nodes could only repeat an anonymous
    // {name, url} stub, so Google saw three lookalike Organization fragments
    // instead of one entity referenced three times. An @id turns them into a
    // single graph node.
    '@id': ORGANIZATION_ID,
    name: 'Cafrezzo',
    url: BASE_URL,
    logo: LOGO_URL,
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+33-6-03-84-11-94',
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
    // Grossiste/distributeur leads, because that is the commercial position
    // the site is being ranked for; "torréfacteur" is retained because it is
    // true, but it is no longer the first thing the entity claims to be.
    description:
        'Grossiste et distributeur de café et de machines à café, également torréfacteur. Cafrezzo fournit les professionnels — cafés, restaurants, hôtels, bars, coffee shops, bureaux et entreprises — en cafés en grains, cafés moulus, capsules et machines à café professionnelles. Marques distribuées : Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, Kimbo, Covim et Caprimo. Boutique à Gonesse, aux portes de Paris, avec service en Île-de-France et livraison en France, Belgique, Luxembourg et Suisse.',
    // Countries we actually ship to, per the FAQ and delivery terms.
    areaServed: ['FR', 'BE', 'LU', 'CH'],
    // Topical scope of the business, stated explicitly.
    //
    // `knowsAbout` is the property answer engines read to decide what an
    // organisation is authoritative on. Without it, "Cafrezzo" resolves as a
    // generic online shop; with it, the entity is tied to the wholesale and
    // professional-supply topics the site is competing for.
    knowsAbout: [
        'Grossiste café',
        'Distributeur de café',
        'Fournisseur de café pour professionnels',
        'Café CHR',
        'Café en grains',
        'Café moulu',
        'Capsules de café',
        'Machines à café professionnelles',
        'Équipement café pour restaurants et hôtels',
    ],
    // French business identifiers — strong entity signals for a FR retailer.
    vatID: 'FR17102596061',
    taxID: '102 596 061 00014',
    email: 'boutique@cafrezzo.com',
    address: POSTAL_ADDRESS,
};

/**
 * Approximate coordinates for the Gonesse shop.
 *
 * TODO(ops): replace with the exact rooftop lat/long from the Google Business
 * Profile listing. This is the commune centroid, accurate to a few hundred
 * metres — good enough to corroborate the postal address for an answer
 * engine, but it is not what places the Map Pack pin. That comes from GBP.
 */
const GEO = {
    '@type': 'GeoCoordinates',
    latitude: 48.9872,
    longitude: 2.4486,
} as const;

/**
 * The Île-de-France departments the shop actively serves.
 *
 * Stated explicitly because the commercial target is regional B2B supply
 * ("grossiste café Île-de-France"), and a bare postal address only says
 * where the business sits — not how far it delivers. Each entry is the
 * administrative department, which is the unit French B2B buyers search in.
 */
const IDF_AREA_SERVED = [
    { '@type': 'AdministrativeArea', name: 'Paris (75)' },
    { '@type': 'AdministrativeArea', name: 'Val-d’Oise (95)' },
    { '@type': 'AdministrativeArea', name: 'Seine-Saint-Denis (93)' },
    { '@type': 'AdministrativeArea', name: 'Hauts-de-Seine (92)' },
    { '@type': 'AdministrativeArea', name: 'Seine-et-Marne (77)' },
    { '@type': 'AdministrativeArea', name: 'Yvelines (78)' },
    { '@type': 'AdministrativeArea', name: 'Essonne (91)' },
    { '@type': 'AdministrativeArea', name: 'Val-de-Marne (94)' },
    { '@type': 'AdministrativeArea', name: 'Île-de-France' },
] as const;

/**
 * JSON-LD for the physical shop.
 *
 * Distinct from `organizationSchema`: that identifies the business entity,
 * this describes a visitable location and is what drives local/map results
 * for queries like "grossiste café Gonesse".
 *
 * Typed as both Store and WholesaleStore. The business genuinely does both —
 * a walk-in shop and trade supply — and the wholesale half is the half being
 * ranked for, so it has to be stated in the vocabulary rather than only in
 * the prose. Note `WholesaleStore` is the real schema.org term; `Wholesaler`
 * is not in the vocabulary and would be silently discarded.
 */
/**
 * The single local-business node for the Gonesse shop.
 *
 * There used to be two: `storeSchema` (on /contact and /visit-shop) and
 * `wholesalerSchema` (on the B2B landing pages). Both claimed the same
 * `@id` — `https://cafrezzo.com/#store` — while disagreeing about `@type`
 * (`Store` vs `LocalBusiness`), `url` (/visit-shop vs /professionnels) and
 * which of `description`, `vatID`, `taxID` and `parentOrganization` they
 * carried.
 *
 * An `@id` *is* the identity: Google merges nodes that share one, so the
 * business was being described two different ways depending on which page got
 * crawled last. That is the "duplicate or conflicting schema" failure mode,
 * and on a local entity it undermines exactly the signal the map pack reads.
 *
 * Now there is one node, carrying the union of both. `WholesaleStore` is a
 * subtype of `Store`, which is a subtype of `LocalBusiness`, so this types the
 * business as specifically as the vocabulary allows while still satisfying
 * every consumer looking for a LocalBusiness.
 */
const LOCAL_BUSINESS_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': ['Store', 'WholesaleStore'],
    '@id': `${BASE_URL}/#store`,
    name: 'Cafrezzo',
    // Locale-prefixed: the bare /visit-shop 308s to /fr/visit-shop, and a
    // schema `url` that redirects is an avoidable hop for anything resolving
    // the entity.
    url: `${BASE_URL}/fr/visit-shop`,
    image: `${BASE_URL}${OG_IMAGE}`,
    logo: LOGO_URL,
    telephone: '+33-6-03-84-11-94',
    email: 'boutique@cafrezzo.com',
    address: POSTAL_ADDRESS,
    geo: GEO,
    areaServed: IDF_AREA_SERVED,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    vatID: 'FR17102596061',
    taxID: '102 596 061 00014',
    parentOrganization: { '@id': ORGANIZATION_ID },
    description:
        'Grossiste et fournisseur de café pour les professionnels d’Île-de-France. ' +
        'Cafrezzo livre les cafés, restaurants, hôtels, bars, coffee shops, bureaux et ' +
        'entreprises en café en grains, café moulu, capsules et machines à café ' +
        'professionnelles. Achat au carton et à la palette, tarifs dégressifs. ' +
        'Marques distribuées : Lavazza, Delta Cafés, Bristot, Carte Noire, Mambo, ' +
        'Kimbo, Covim et Caprimo.',
    /**
     * Real trading hours, taken from the shop's own store-locations record.
     *
     * This previously declared a single continuous Monday–Friday 09:00–17:00
     * block, which was wrong twice over: it ignored the midday closure, and it
     * omitted Saturday entirely — so Google was being told the shop is shut on
     * one of the days it actually trades. For a local business that is a
     * direct loss of "open now" eligibility in the map pack every Saturday.
     *
     * Each contiguous trading period needs its own specification; a lunch
     * break cannot be expressed inside one opens/closes pair.
     */
    openingHoursSpecification: [
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '12:30',
        },
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '13:30',
            closes: '17:30',
        },
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Saturday'],
            opens: '09:00',
            closes: '12:30',
        },
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Saturday'],
            opens: '13:30',
            closes: '16:00',
        },
    ],
};

/**
 * Both names resolve to the same node, so the two dozen existing call sites
 * keep working and it is now impossible for them to drift apart again.
 */
export const storeSchema = LOCAL_BUSINESS_SCHEMA;

/**
 * LocalBusiness/WholesaleStore schema for the commercial landing pages.
 *
 * Separate from `storeSchema` on purpose. That one is scoped to the visitable
 * shop and belongs on /contact and /visit-shop. This one is the B2B supplier
 * claim — same NAP, same `@id` so the two resolve to one entity rather than
 * competing, but carrying the wholesale description and service area that a
 * "grossiste café Paris" query is actually matching against.
 */
export const wholesalerSchema = LOCAL_BUSINESS_SCHEMA;

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
        publisher: { '@id': ORGANIZATION_ID },
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
/** ISO date one year out, for `Offer.priceValidUntil`. */
function priceValidUntil(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
}

export function generateProductSchema(product: {
    locale: Locale;
    name: string;
    description?: string;
    slug: string;
    image: string;
    price: number;
    inStock?: boolean;
    sku?: string;
    /**
     * EAN-13 barcode, when the catalogue has one. Currently never supplied —
     * see the note on `SaleUnit.gtin13`. Emitted as `gtin13` when present.
     */
    gtin13?: string;
    ratingValue?: number | null;
    reviewCount?: number | null;
    /**
     * The manufacturer's brand (Lavazza, Delta, Bristot, ...), not the retailer.
     *
     * Cafrezzo resells other roasters' brands, so defaulting this to "Cafrezzo"
     * — as it previously did — mislabels every product in the catalogue and
     * throws away the entity match for "café Lavazza" and friends. Falls back
     * to Cafrezzo only when the catalogue genuinely has no brand on the record.
     */
    brand?: string;
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
        // Only emitted when the catalogue actually carries a barcode. A
        // fabricated or placeholder GTIN is worse than none: Google validates
        // check digits and treats a bad one as a structured-data error.
        ...(product.gtin13 ? { gtin13: product.gtin13 } : {}),
        brand: { '@type': 'Brand', name: product.brand?.trim() || 'Cafrezzo' },
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
            // Rolling one-year horizon, recomputed on every revalidation.
            //
            // Google drops an offer whose priceValidUntil has passed, so a
            // fixed date would quietly delist the whole catalogue from rich
            // results on its expiry day. This is an offer-expiry hint rather
            // than a claim about the product, and a rolling window is the
            // standard way to express "this price stands until further notice".
            priceValidUntil: priceValidUntil(),
            price: product.price.toFixed(2),
            itemCondition: 'https://schema.org/NewCondition',
            availability: product.inStock !== false
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: 'Cafrezzo', url: BASE_URL },
            shippingDetails: SHIPPING_DETAILS,
            hasMerchantReturnPolicy: RETURN_POLICY,
        },
    };
}

/**
 * Standard delivery terms, as an OfferShippingDetails node.
 *
 * Every figure here is read off the live shipping-methods endpoint and the
 * published returns policy — nothing is assumed. Google shows shipping cost
 * and delivery window directly in product results when this is present, and
 * omitting it is one of the few merchant-listing warnings that actually costs
 * click-through on a price-comparison query.
 *
 * Standard delivery: €5.99, free above €150, 5–7 business days in transit.
 */
const SHIPPING_DETAILS = {
    '@type': 'OfferShippingDetails',
    shippingRate: {
        '@type': 'MonetaryAmount',
        value: '5.99',
        currency: 'EUR',
    },
    shippingDestination: ['FR', 'BE', 'LU', 'CH'].map(country => ({
        '@type': 'DefinedRegion',
        addressCountry: country,
    })),
    deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
        },
        transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 5,
            maxValue: 7,
            unitCode: 'DAY',
        },
    },
} as const;

/**
 * Returns policy: 14 days, unopened, buyer pays return shipping.
 *
 * Mirrors `returnPolicyBullet1` and the withdrawal right in the T&Cs. The
 * 14-day window is the statutory EU right the site already states, not an
 * invented commercial gesture.
 */
const RETURN_POLICY = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: ['FR', 'BE', 'LU', 'CH'],
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 14,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnShippingFees',
} as const;

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
