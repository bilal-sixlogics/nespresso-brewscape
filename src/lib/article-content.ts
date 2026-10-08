/**
 * Journal article content: which language an article is written in, and
 * render-time clean-up of the HTML that comes out of the CMS.
 *
 * Framework-free and free of "use client", so the server page, the sitemap and
 * the client fallback in BlogPostClient all share one definition.
 */

import { DEFAULT_LOCALE, isLocale, linkLocale, type Locale } from './i18n';

// ── Language ─────────────────────────────────────────────────────────────────

/**
 * Explicit language for an article, keyed by CMS slug.
 *
 * Only needed when detection would get it wrong. The CMS has no language
 * field, so without this the only signal is the text itself.
 */
const ARTICLE_LANGUAGE_OVERRIDES: Record<string, Locale> = {
    'coffee-wholesale-in-paris-how-to-choose-the-right-supplier-for-your-business': 'en',
};

// Function words that are frequent in one language and rare in the other.
// Counting them is crude but reliable on a full article body.
const FR_MARKERS = /\b(le|la|les|des|du|une|est|et|pour|avec|vous|dans|qui|sur|pas)\b/g;
const EN_MARKERS = /\b(the|and|for|with|you|your|is|are|this|that|of|to|in|on)\b/g;

/**
 * The single language an article exists in.
 *
 * Articles are not translated: the CMS stores one body per post, and every
 * locale used to serve that same body under its own `lang`, canonical and
 * hreflang cluster. That published each article five times — four of them
 * copies claiming to be German, Russian or Dutch translations of French text.
 * Every route that decides whether an article URL exists (the page itself,
 * generateStaticParams, the sitemap) asks this function, so they cannot
 * disagree.
 */
export function articleLocale(post: { slug?: string; title?: string; body?: string | null }): Locale {
    const override = post.slug ? ARTICLE_LANGUAGE_OVERRIDES[post.slug] : undefined;
    if (override) return override;

    const text = `${post.title ?? ''} ${stripTags(post.body ?? '')}`.toLowerCase();
    const fr = text.match(FR_MARKERS)?.length ?? 0;
    const en = text.match(EN_MARKERS)?.length ?? 0;
    // French wins ties: it is the site's primary market and default locale.
    return en > fr * 1.5 ? 'en' : DEFAULT_LOCALE;
}

// ── Clean-up ─────────────────────────────────────────────────────────────────

/**
 * Citation tokens left behind when text is pasted out of ChatGPT, e.g.
 * `:contentReference[oaicite:5]{index=5}` and
 * `:chatgpt-content-reference{index="2"}`. They render as literal text.
 */
const AI_CITATION_MARKERS: RegExp[] = [
    /\s*:?contentReference\[oaicite:\d+\]\{index=\d+\}/g,
    /\s*:?chatgpt-content-reference\{index=(?:"|&quot;)?\d+(?:"|&quot;)?\}/g,
    /\s*\[oaicite:\d+\]/g,
    /\s*【\d+†[^】]*】/g,
];

/** True when the HTML still carries AI citation tokens. */
export function hasAiCitationMarkers(html: string): boolean {
    return AI_CITATION_MARKERS.some(re => new RegExp(re.source).test(html));
}

/**
 * Sentences that narrate the source page the text was written from ("La fiche
 * produit explique également que …"). The clause is dropped and the statement
 * it introduces is kept, re-capitalised.
 */
const SOURCE_NARRATION: Array<[RegExp, string]> = [
    [/\b(?:La|Sa) fiche produit (?:explique|indique|précise|mentionne|souligne)(?: également| aussi)? que (\S)/g, '$1'],
    [/\b(?:La|Sa) fiche produit met en avant /g, 'Il s’agit d’'],
];

// Pictographic emoji plus the joiners and variation selectors that ride along.
const LEADING_EMOJI = /^(?:\s|[\p{Extended_Pictographic}\p{Regional_Indicator}\u200d\ufe0f])+/u;

function stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, ' ');
}

function normalise(text: string): string {
    return stripTags(text)
        .replace(LEADING_EMOJI, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/** Word-overlap similarity between two headings, 0–1. */
function headingSimilarity(a: string, b: string): number {
    const A = new Set(normalise(a).split(' ').filter(w => w.length > 2));
    const B = new Set(normalise(b).split(' ').filter(w => w.length > 2));
    if (!A.size || !B.size) return 0;
    let shared = 0;
    for (const w of A) if (B.has(w)) shared++;
    return shared / Math.min(A.size, B.size);
}

/**
 * Cleans an article body for rendering.
 *
 * - Removes ChatGPT citation tokens.
 * - Rewrites "la fiche produit explique que…" narration into plain statements.
 * - Drops the body's opening heading when it restates the page title. The page
 *   already renders the title as the <h1>; the editor pastes it in again.
 * - Strips emoji from the start of headings, which otherwise lead every entry
 *   in the outline search engines and answer engines extract.
 * - Points links to cafrezzo.com at the article's own locale, as relative
 *   paths. Product pieces linked French readers to /en/shop/….
 *
 * Applied to sanitised HTML: it only removes text or rewrites attributes that
 * already passed DOMPurify, so it cannot introduce markup.
 */
export function cleanArticleHtml(html: string, opts: { title: string; locale: Locale }): string {
    let out = html;

    for (const re of AI_CITATION_MARKERS) out = out.replace(re, '');
    for (const [re, replacement] of SOURCE_NARRATION) {
        out = out.replace(re, (_match, next?: string) =>
            typeof next === 'string' && replacement === '$1' ? next.toUpperCase() : replacement,
        );
    }

    const opening = out.match(/^\s*<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/);
    if (opening && headingSimilarity(opening[2], opts.title) >= 0.6) {
        out = out.slice(opening[0].length);
    }

    out = out.replace(/(<h[1-6][^>]*>)([\s\S]*?)(<\/h[1-6]>)/g, (_m, open, inner, close) => {
        // Emoji can sit inside a leading <strong>; strip them there too.
        const cleaned = inner
            .replace(LEADING_EMOJI, '')
            .replace(/^(<[^>]+>)\s*((?:[\p{Extended_Pictographic}\p{Regional_Indicator}\u200d\ufe0f]|\s)+)/u, '$1');
        return `${open}${cleaned}${close}`;
    });

    out = out.replace(
        /href="(?:https?:\/\/(?:www\.)?cafrezzo\.com)?\/([a-z]{2})(\/[^"]*)?"/g,
        (match, prefix: string, rest = '') =>
            isLocale(prefix) ? `href="/${linkLocale(opts.locale, rest || '/')}${rest}"` : match,
    );

    return out;
}

/** Cleans a plain-text field (excerpt, meta description) of citation tokens. */
export function cleanArticleText(text: string): string;
export function cleanArticleText(text: string | null | undefined): string | undefined;
export function cleanArticleText(text: string | null | undefined): string | undefined {
    if (!text) return text ?? undefined;
    let out = text;
    for (const re of AI_CITATION_MARKERS) out = out.replace(re, '');
    return out.trim();
}

function wordCount(html: string | null | undefined): number {
    return stripTags(html ?? '').split(/\s+/).filter(Boolean).length;
}

/** Estimated reading time in whole minutes, at 220 words per minute. */
export function readingMinutes(html: string | null | undefined): number {
    return Math.max(1, Math.round(wordCount(html) / 220));
}

/** Below this an article is too short to stand as a search result. */
const THIN_ARTICLE_WORDS = 300;

/**
 * True for articles too short to be worth indexing.
 *
 * The eight posts seeded before launch run 95–151 words each: a recipe
 * ingredient list, a two-paragraph history note, an expired January sale.
 * Indexed, they are thin pages that weigh on how the whole journal is judged.
 * They stay published for readers but are noindexed and left out of the
 * sitemap; expanding one in the CMS past the threshold brings it back
 * automatically.
 */
export function isThinArticle(post: { body?: string | null }): boolean {
    return wordCount(post.body) < THIN_ARTICLE_WORDS;
}
