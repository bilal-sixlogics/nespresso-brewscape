import { NextRequest, NextResponse } from 'next/server';

import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from '@/lib/i18n';

/**
 * Locale routing.
 *
 * Every page lives under a locale prefix (/fr/shop, /en/shop, ...). Requests
 * for a bare path are redirected to the equivalent prefixed URL.
 *
 * The redirect to the DEFAULT locale is a 308 (permanent) because /shop is
 * genuinely, permanently now /fr/shop — that is the signal Google needs to
 * move the existing index entries across. Redirects driven by a visitor's
 * Accept-Language or cookie are 307 (temporary), because the correct target
 * varies per visitor and must never be cached as canonical.
 */

// Paths that must never be locale-prefixed.
const EXCLUDED = [
    '/api',
    '/_next',
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
    '/favicon.ico',
];

function isExcluded(pathname: string): boolean {
    if (EXCLUDED.some(p => pathname === p || pathname.startsWith(`${p}/`))) return true;
    // Any request for a file with an extension (images, fonts, .well-known
    // assets) is static and has no locale.
    return /\.[a-zA-Z0-9]+$/.test(pathname);
}

/** Best-matching supported locale from the Accept-Language header, or null. */
function preferredLocale(header: string | null): Locale | null {
    if (!header) return null;
    const ranked = header
        .split(',')
        .map(part => {
            const [tag, ...params] = part.trim().split(';');
            const q = params.find(p => p.trim().startsWith('q='));
            return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q.split('=')[1]) : 1 };
        })
        .sort((a, b) => b.q - a.q);

    for (const { tag } of ranked) {
        const base = tag.split('-')[0];
        if (isLocale(base)) return base;
    }
    return null;
}

/**
 * AI crawler user-agents worth observing.
 *
 * These were blocked in robots.txt until recently. Logging their hits is the
 * only direct evidence that unblocking them actually produced crawl activity —
 * they do not appear in Google Search Console, and most never execute the
 * JavaScript that analytics depends on, so GA cannot see them either.
 *
 * Emitted as a single-line JSON record to stdout, which is where the hosting
 * platform's log drain picks it up. No cookies, no identifiers, no consent
 * surface: this records a bot fetch, not a person.
 */
const AI_AGENT_PATTERNS: Array<[label: string, test: RegExp]> = [
    ['GPTBot', /GPTBot/i],
    ['OAI-SearchBot', /OAI-SearchBot/i],
    ['ChatGPT-User', /ChatGPT-User/i],
    ['ClaudeBot', /ClaudeBot/i],
    ['Claude-User', /Claude-User/i],
    ['anthropic-ai', /anthropic-ai/i],
    ['PerplexityBot', /PerplexityBot/i],
    ['Perplexity-User', /Perplexity-User/i],
    ['Google-Extended', /Google-Extended/i],
    ['Applebot-Extended', /Applebot-Extended/i],
    ['CCBot', /CCBot/i],
    ['Bytespider', /Bytespider/i],
    ['meta-externalagent', /meta-externalagent/i],
];

function logAiCrawler(request: NextRequest, pathname: string): void {
    const ua = request.headers.get('user-agent');
    if (!ua) return;
    const match = AI_AGENT_PATTERNS.find(([, test]) => test.test(ua));
    if (!match) return;

    console.log(
        JSON.stringify({
            evt: 'ai_crawler',
            agent: match[0],
            path: pathname,
            // Bots do not carry a referer that identifies a person.
            ref: request.headers.get('referer') ?? null,
        }),
    );
}

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    logAiCrawler(request, pathname);

    if (isExcluded(pathname)) return NextResponse.next();

    const firstSegment = pathname.split('/')[1];

    // Already correctly prefixed — nothing to do.
    if (isLocale(firstSegment)) return NextResponse.next();

    // A two-letter segment that is NOT a supported locale (e.g. /es/shop) is
    // left alone so the [locale] layout can 404 it. Prefixing it would produce
    // /fr/es/shop, a nonsense URL that resolves to nothing.
    if (/^[a-z]{2}$/.test(firstSegment)) return NextResponse.next();

    // Bare path: pick the destination locale.
    const cookieLocale = request.cookies.get('cafrezzo-locale')?.value;
    const chosen: Locale = isLocale(cookieLocale)
        ? cookieLocale
        : preferredLocale(request.headers.get('accept-language')) ?? DEFAULT_LOCALE;

    const url = request.nextUrl.clone();
    url.pathname = `/${chosen}${pathname === '/' ? '' : pathname}`;
    url.search = search;

    // Permanent only when landing on the default locale, which is the true new
    // home of the old URL. Personalised targets stay temporary.
    return chosen === DEFAULT_LOCALE
        ? NextResponse.redirect(url, 308)
        : NextResponse.redirect(url, 307);
}

export const config = {
    // Skip Next internals and anything that looks like a file.
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// Referenced so the locale list stays visibly coupled to this file's behaviour.
void LOCALES;
