/**
 * Journal → commercial page consolidation.
 *
 * Between 27 August and 21 September 2026 the journal published eight articles
 * on a single intent, alongside nine landing pages targeting the same terms.
 * Six URLs competed for "grossiste café Paris" and five for "machine à café
 * professionnelle"; four of the articles carry functionally identical meta
 * descriptions, so Google had no basis on which to prefer any of them.
 *
 * The measured result: the whole "fournisseur/grossiste" cluster drew 105
 * impressions across seven queries and **zero** clicks, with the best article
 * stuck at position 14.38. That position is not a snippet problem — at page 2,
 * 133 impressions predicts about one click, so zero is unremarkable. It is a
 * page-type problem: every result ranking above it is a supplier page, and a
 * vendor-authored "comment choisir" essay has no slot in a commercial SERP.
 *
 * Consolidating transfers that accumulated relevance to pages that are the
 * right type and can realistically reach the top ten, and stops nine URLs
 * splitting the internal anchor signal between them.
 *
 * Reversible by design: this map is the only place the decision lives. Delete
 * an entry and the article resolves normally again — the content itself is
 * untouched in the CMS, not deleted.
 *
 * Keys are journal slugs (locale-free). Values are locale-free destination
 * paths.
 */
export const JOURNAL_CONSOLIDATION: Record<string, string> = {
    // The four generic "how to choose a wholesaler" pieces → the B2B hub,
    // which is the supplier page this intent actually wants.
    'grossiste-cafe-comment-choisir-son-fournisseur-de-cafe-professionnel':
        '/professionnels',
    'comment-choisir-le-meilleur-grossiste-de-cafe-en-france-guide-pour-les-professionnels':
        '/professionnels',
    'cafe-chr-comment-choisir-un-grossiste-de-cafe-et-une-machine-a-cafe-professionnelle':
        '/professionnels',
    'fournisseur-de-cafe-chr-a-paris-cafe-capsules-et-machines-a-cafe-professionnelles':
        '/professionnels',

    // The Paris/Île-de-France variants → the Paris landing page, which already
    // holds the exact-match H1, title and URL for that query.
    'meilleur-grossiste-cafe-a-paris-comment-choisir-son-fournisseur-professionnel':
        '/grossiste-cafe-paris',
    'grossiste-cafe-a-paris-et-en-ile-de-france-comment-choisir-son-fournisseur':
        '/grossiste-cafe-paris',
    'grossiste-de-cafe-a-paris-cafrezzo-votre-partenaire-cafe-pour-les-professionnels':
        '/grossiste-cafe-paris',

    // The machine piece → the machine selection page.
    'machine-a-cafe-professionnelle-a-paris-trouvez-la-solution-ideale-avec-cafrezzo':
        '/machine-a-cafe-professionnelle',
};

/**
 * Public journal slugs that differ from the slug stored in the CMS.
 *
 * Keys are the URL slug readers and crawlers see; values are the CMS slug the
 * article is fetched by. The CMS slug 308s to the public one.
 *
 * Exists because the CMS appended numeric suffixes (`-1` … `-5`) when the
 * articles were created, and because the "meilleurs grossistes" piece was
 * retitled as the how-to-choose guide it actually is. Renaming in the CMS
 * would break every existing link; aliasing here keeps the old URL working as
 * a redirect and needs no CMS change.
 *
 * If a slug is later renamed in the CMS to match its public slug, delete the
 * entry: the article then resolves directly.
 */
export const JOURNAL_SLUG_ALIASES: Record<string, string> = {
    'prix-cafe-professionnel-cout-par-tasse':
        'prix-du-cafe-professionnel-comment-calculer-le-cout-par-tasse-5',
    'prix-machine-a-cafe-professionnelle':
        'prix-machine-a-cafe-professionnelle-quel-budget-prevoir-4',
    'fournisseur-cafe-entreprise': 'fournisseur-cafe-entreprise-quelle-machine-choisir-2',
    'fournisseur-cafe-coffee-shop': 'fournisseur-cafe-coffee-shop-comment-bien-choisir-3',
    'fournisseur-cafe-restaurant-paris': 'fournisseur-cafe-restaurant-a-paris-comment-choisir-1',
    'comment-choisir-grossiste-cafe-paris':
        'meilleurs-grossistes-de-cafe-a-paris-guide-2026-pour-les-professionnels',
};

const PUBLIC_SLUG_BY_CMS_SLUG: Record<string, string> = Object.fromEntries(
    Object.entries(JOURNAL_SLUG_ALIASES).map(([publicSlug, cmsSlug]) => [cmsSlug, publicSlug]),
);

/** The CMS slug to fetch for a public journal slug. */
export function cmsJournalSlug(publicSlug: string): string {
    return JOURNAL_SLUG_ALIASES[publicSlug] ?? publicSlug;
}

/** The slug to publish a CMS article under. */
export function publicJournalSlug(cmsSlug: string): string {
    return PUBLIC_SLUG_BY_CMS_SLUG[cmsSlug] ?? cmsSlug;
}

/** True when this is an old CMS slug that now redirects to its public slug. */
export function isAliasedCmsJournalSlug(slug: string): boolean {
    return slug in PUBLIC_SLUG_BY_CMS_SLUG;
}

/** Destination for a consolidated journal slug, or null if it still stands. */
export function journalRedirectTarget(slug: string): string | null {
    return JOURNAL_CONSOLIDATION[slug] ?? null;
}

/** True when this journal slug has been consolidated away. */
export function isConsolidatedJournalSlug(slug: string | undefined): boolean {
    return !!slug && slug in JOURNAL_CONSOLIDATION;
}
