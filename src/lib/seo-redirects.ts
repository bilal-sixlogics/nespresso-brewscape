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

/** Destination for a consolidated journal slug, or null if it still stands. */
export function journalRedirectTarget(slug: string): string | null {
    return JOURNAL_CONSOLIDATION[slug] ?? null;
}

/** True when this journal slug has been consolidated away. */
export function isConsolidatedJournalSlug(slug: string | undefined): boolean {
    return !!slug && slug in JOURNAL_CONSOLIDATION;
}
