/**
 * Search-result copy for journal articles whose CMS SEO fields are empty.
 *
 * Every post in the CMS has `meta_title` and `meta_description` unset, so the
 * <title> fell back to the full headline (up to 88 characters before the
 * " | Cafrezzo" suffix) and the description to the excerpt (up to 256). Google
 * truncates at roughly 60 and 155. These are written to fit.
 *
 * Fallbacks only: a value entered in the CMS always wins, so editors can take
 * over any of these without a deploy. Keyed by CMS slug.
 */

import { articleLocale, cleanArticleText, readingMinutes } from './article-content';
import { localePath, type Locale } from './i18n';
import { publicJournalSlug } from './seo-redirects';

interface JournalSeoCopy {
    /** Replaces the headline on the page itself (the <h1>), not only in search. */
    headline?: string;
    /** <title>, without the " | Cafrezzo" suffix. Keep under ~49 characters. */
    metaTitle?: string;
    /** Meta description. Keep under ~155 characters. */
    metaDescription?: string;
}

export const JOURNAL_SEO_COPY: Record<string, JournalSeoCopy> = {
    // Retitled: the piece compares supplier types and never ranked anyone,
    // so "Meilleurs grossistes" promised a list it did not contain.
    'meilleurs-grossistes-de-cafe-a-paris-guide-2026-pour-les-professionnels': {
        headline: 'Comment choisir un grossiste de café à Paris',
        metaTitle: 'Comment choisir un grossiste de café à Paris',
        metaDescription:
            'Torréfacteur, distributeur ou plateforme B2B ? Les critères pour comparer les grossistes de café à Paris : prix, livraison, machines et service.',
    },
    'coffee-wholesale-in-paris-how-to-choose-the-right-supplier-for-your-business': {
        metaTitle: 'Coffee wholesale in Paris: choosing a supplier',
        metaDescription:
            'What to look for in a coffee wholesaler in Paris: beans, capsules, machines, trade pricing, delivery and dependable supply for cafés and restaurants.',
    },
    'prix-du-cafe-professionnel-comment-calculer-le-cout-par-tasse-5': {
        metaTitle: 'Prix du café pro : calculer le coût par tasse',
    },
    'prix-machine-a-cafe-professionnelle-quel-budget-prevoir-4': {
        metaTitle: 'Prix d’une machine à café professionnelle',
    },
    'fournisseur-cafe-entreprise-quelle-machine-choisir-2': {
        metaTitle: 'Fournisseur café entreprise : quelle machine ?',
    },
    'fournisseur-cafe-coffee-shop-comment-bien-choisir-3': {
        metaTitle: 'Fournisseur café coffee shop : bien choisir',
    },
    'fournisseur-cafe-restaurant-a-paris-comment-choisir-1': {
        metaTitle: 'Fournisseur café restaurant à Paris : le guide',
    },
    'delta-cafes-gran-crema-1kg-pourquoi-choisir-ce-cafe-100-arabica': {
        metaTitle: 'Delta Cafés Gran Crema 1 kg : avis et profil',
        metaDescription:
            'Delta Cafés Gran Crema 1 kg : café en grains 100 % Arabica aux notes de noix, de cèdre et de chocolat noir. Préparation, dosage et accords.',
    },
    'bristot-bean-to-cup-1kg-pourquoi-choisir-ce-cafe-en-grains': {
        metaTitle: 'Bristot Bean To Cup 1 kg : profil et usage pro',
        metaDescription:
            'Bristot Bean To Cup 1 kg : café en grains aux notes de chocolat, céréales et fruits secs, pensé pour les machines automatiques et l’usage pro.',
    },
    'lavazza-tales-of-napoli-pourquoi-choisir-ce-cafe-en-grains': {
        metaTitle: 'Lavazza Tales of Napoli : profil et préparation',
        metaDescription:
            'Lavazza Tales of Napoli 450 g : intensité, notes de cacao et de caramel, méthodes de préparation et accords gourmands à essayer.',
    },
    'carte-noire-cafe-moulu-250g-pourquoi-choisir-ce-cafe': {
        metaTitle: 'Carte Noire moulu 250 g : profil et dégustation',
        metaDescription:
            'Carte Noire Café Moulu 250 g : café riche aux notes de céréales grillées, de chocolat et de fruits secs. Profil, préparation et dégustation.',
    },
    'arabica-ou-robusta-quelles-differences-et-quel-cafe-choisir': {
        metaTitle: 'Arabica ou Robusta : différences et choix',
    },
};

/**
 * The one URL an article is published at: its own language, its public slug.
 * Every listing links here directly rather than through a redirect.
 */
export function journalPath(post: { slug?: string; title?: string; body?: string | null }): string {
    return localePath(articleLocale(post), `/journal/${publicJournalSlug(post.slug ?? '')}`);
}

/** What a journal listing needs to show one article. No body: it is not shown. */
export interface JournalCard {
    id: number;
    href: string;
    title: string;
    category?: string;
    excerpt: string;
    image?: string;
    publishedAt?: string;
    readMinutes: number;
}

export function toJournalCard(post: {
    id: number;
    slug?: string;
    title: string;
    body?: string | null;
    category?: string | null;
    excerpt?: string | null;
    featured_image?: string | null;
    published_at?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
}): JournalCard {
    return {
        id: post.id,
        href: journalPath(post),
        title: journalSeo(post).headline,
        category: post.category ?? undefined,
        excerpt: cleanArticleText(post.excerpt) ?? '',
        image: post.featured_image ?? undefined,
        publishedAt: post.published_at ?? undefined,
        readMinutes: readingMinutes(post.body),
    };
}

/**
 * Byline as displayed. The pre-launch posts were seeded under the project's
 * working name ("L'équipe Brewscape"), which is not a brand the reader knows.
 */
export function displayAuthor(name?: string | null): string | undefined {
    if (!name) return undefined;
    return name.replace(/brewscape/gi, 'Cafrezzo');
}

/**
 * CMS category names are stored in English; the French journal displayed
 * "Offers", "Recipes" and "Coffee Stories". Unknown categories pass through.
 */
const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
    offers:          { fr: 'Offres',            en: 'Offers',         de: 'Angebote',          ru: 'Предложения',     nl: 'Aanbiedingen' },
    recipes:         { fr: 'Recettes',          en: 'Recipes',        de: 'Rezepte',           ru: 'Рецепты',         nl: 'Recepten' },
    'coffee stories':{ fr: 'Histoires de café', en: 'Coffee Stories', de: 'Kaffeegeschichten', ru: 'Истории о кофе',  nl: 'Koffieverhalen' },
    'life hacks':    { fr: 'Astuces',           en: 'Life Hacks',     de: 'Tipps',             ru: 'Лайфхаки',        nl: 'Tips' },
    holidays:        { fr: 'Fêtes',             en: 'Holidays',       de: 'Feiertage',         ru: 'Праздники',       nl: 'Feestdagen' },
};

export function journalCategoryLabel(category: string, locale: Locale): string {
    return CATEGORY_LABELS[category.trim().toLowerCase()]?.[locale] ?? category;
}

/** Cuts text to `max` characters at a word boundary, adding an ellipsis. */
function clip(text: string, max: number): string {
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.–-]+$/, '')}…`;
}

/**
 * Headline, <title> and description for an article.
 *
 * Order of precedence: the CMS field, then the copy above, then a value
 * derived from the post. The derived description is clipped at a word
 * boundary so it never ends mid-word in a result snippet.
 */
export function journalSeo(post: {
    slug?: string;
    title: string;
    excerpt?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
}): { headline: string; metaTitle: string; metaDescription?: string } {
    const copy = (post.slug && JOURNAL_SEO_COPY[post.slug]) || {};
    const headline = copy.headline ?? post.title;
    const derived = post.excerpt ? clip(post.excerpt, 155) : undefined;
    return {
        headline,
        metaTitle: post.meta_title || copy.metaTitle || headline,
        metaDescription: post.meta_description || copy.metaDescription || derived,
    };
}
