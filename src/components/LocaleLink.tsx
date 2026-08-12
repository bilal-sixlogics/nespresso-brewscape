"use client";

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { isLocale, localeFromPathname, type Locale } from '@/lib/i18n';

/**
 * Drop-in replacement for `next/link` that keeps the visitor inside their locale.
 *
 * Every page lives under a locale prefix, so a bare `href="/shop"` would hit
 * the middleware and bounce through a redirect on every single internal click —
 * slower for visitors and wasted crawl budget for bots. This prefixes internal
 * hrefs with the locale of the current URL.
 *
 * Left untouched: absolute URLs, mailto/tel, hash-only links, and anything
 * already carrying a locale prefix.
 */

function prefix(href: string, locale: Locale): string {
    if (!href.startsWith('/')) return href;      // external, hash, or relative
    if (href.startsWith('//')) return href;      // protocol-relative

    const [pathPart, ...rest] = href.split(/(?=[?#])/);
    const first = pathPart.split('/')[1];
    if (isLocale(first)) return href;            // already prefixed

    const base = pathPart === '/' ? '' : pathPart;
    return `/${locale}${base}${rest.join('')}`;
}

type Props = React.ComponentProps<typeof NextLink>;

export default function LocaleLink({ href, ...props }: Props) {
    const pathname = usePathname();
    const locale = localeFromPathname(pathname || '/');

    const resolved =
        typeof href === 'string'
            ? prefix(href, locale)
            : href && typeof href === 'object' && typeof href.pathname === 'string'
              ? { ...href, pathname: prefix(href.pathname, locale) }
              : href;

    return <NextLink href={resolved} {...props} />;
}

export { LocaleLink };
