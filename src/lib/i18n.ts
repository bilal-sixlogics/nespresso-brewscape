/**
 * Locale definitions — shared by server and client.
 *
 * Deliberately framework-agnostic and free of "use client", so Server
 * Components (layouts, metadata, sitemap, middleware) can import it without
 * pulling in React context.
 *
 * URL scheme: every locale is prefixed, including the default.
 *   /fr/shop, /en/shop, /de/shop, /ru/shop, /nl/shop
 * A bare path such as /shop is redirected to /fr/shop by middleware.
 */

export const LOCALES = ['fr', 'en', 'de', 'ru', 'nl'] as const;

export type Locale = (typeof LOCALES)[number];

/** French is the primary market and the x-default target. */
export const DEFAULT_LOCALE: Locale = 'fr';

export interface LocaleMeta {
    code: Locale;
    label: string;
    flag: string;
    nativeName: string;
    /** BCP 47 tag for <html lang> and hreflang. */
    hreflang: string;
    /** Open Graph locale format. */
    ogLocale: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
    fr: { code: 'fr', label: 'FR', flag: '🇫🇷', nativeName: 'Français',   hreflang: 'fr-FR', ogLocale: 'fr_FR' },
    en: { code: 'en', label: 'EN', flag: '🇬🇧', nativeName: 'English',    hreflang: 'en-GB', ogLocale: 'en_GB' },
    de: { code: 'de', label: 'DE', flag: '🇩🇪', nativeName: 'Deutsch',    hreflang: 'de-DE', ogLocale: 'de_DE' },
    ru: { code: 'ru', label: 'RU', flag: '🇷🇺', nativeName: 'Русский',    hreflang: 'ru-RU', ogLocale: 'ru_RU' },
    nl: { code: 'nl', label: 'NL', flag: '🇳🇱', nativeName: 'Nederlands', hreflang: 'nl-NL', ogLocale: 'nl_NL' },
};

export const SUPPORTED_LOCALES: LocaleMeta[] = LOCALES.map(code => LOCALE_META[code]);

export function isLocale(value: string | undefined | null): value is Locale {
    return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Narrows an unknown route param to a Locale, falling back to the default. */
export function toLocale(value: string | undefined | null): Locale {
    return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Prefixes a path with a locale.
 * `localePath('en', '/shop')` -> `/en/shop`; `localePath('fr', '/')` -> `/fr`.
 */
export function localePath(locale: Locale, path: string): string {
    const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
    return `/${locale}${clean}`;
}

/**
 * Strips a leading locale segment. `/en/shop` -> `/shop`, `/fr` -> `/`.
 * Returns the path unchanged when it carries no locale prefix.
 */
export function stripLocale(pathname: string): string {
    const match = pathname.match(/^\/([a-z]{2})(?=\/|$)/);
    if (match && isLocale(match[1])) {
        const rest = pathname.slice(match[0].length);
        return rest || '/';
    }
    return pathname;
}

/** Reads the locale out of a pathname, or the default if absent. */
export function localeFromPathname(pathname: string): Locale {
    const match = pathname.match(/^\/([a-z]{2})(?=\/|$)/);
    return match && isLocale(match[1]) ? match[1] : DEFAULT_LOCALE;
}
