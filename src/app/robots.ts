import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://cafrezzo.com';

// Private / transactional routes — no crawler has any reason to index these.
//
// Every page now lives under a locale prefix (/fr/account, /en/account, ...),
// so these are wildcarded. A bare `/account` rule would match nothing at all
// and silently stop protecting anything.
const PRIVATE_SEGMENTS = [
    'account',
    'checkout',
    'order-success',
    'order-failed',
    'login',
    'register',
    'forgot-password',
    'reset-password',
    'wishlist',
    'notifications',
    'orders',
];

const PRIVATE_PATHS = [
    // Locale-prefixed form, e.g. /fr/account — the real URLs.
    ...PRIVATE_SEGMENTS.map(s => `/*/${s}`),
    // Unprefixed form: these redirect to the prefixed URL, but a crawler that
    // never follows the redirect should still be told not to bother.
    ...PRIVATE_SEGMENTS.map(s => `/${s}`),
    '/api/',
];

/**
 * AI assistant crawlers, allowed deliberately.
 *
 * These are how Cafrezzo products get surfaced and cited inside ChatGPT,
 * Claude, Perplexity and Google AI Overviews. Blocking them removes the site
 * from those answers entirely — it does not protect pricing or catalogue data,
 * which is already public to Googlebot.
 *
 * Note the two distinct purposes:
 *  - Retrieval / citation bots (OAI-SearchBot, ChatGPT-User, PerplexityBot,
 *    Claude-User) fetch pages to answer a user's question right now.
 *  - Opt-out tokens (Google-Extended, Applebot-Extended) are not crawlers;
 *    they only control whether already-crawled content may ground AI answers.
 */
const AI_CRAWLERS = [
    // OpenAI
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    // Anthropic
    'ClaudeBot',
    'Claude-User',
    'anthropic-ai',
    // Perplexity
    'PerplexityBot',
    'Perplexity-User',
    // Google Gemini / AI Overviews grounding
    'Google-Extended',
    // Apple Intelligence
    'Applebot-Extended',
    // Common Crawl — feeds many downstream models
    'CCBot',
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: PRIVATE_PATHS,
            },
            {
                userAgent: AI_CRAWLERS,
                allow: '/',
                disallow: PRIVATE_PATHS,
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    };
}
