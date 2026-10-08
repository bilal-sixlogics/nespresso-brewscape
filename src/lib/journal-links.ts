/**
 * Links from commercial pages down to the journal's trade guides.
 *
 * Server-only (it fetches through lib/api/server). The commercial pages linked
 * to /journal at best, so the guides written to support them — restaurant,
 * coffee shop, office, cost per cup, machine budget — received no internal
 * links from the pages they exist to feed.
 */

import type { RelatedLink } from '@/components/seo/RelatedLinks';
import { getBlogPosts } from './api/server';
import { cleanArticleText } from './article-content';
import { journalSeo } from './journal-seo';
import { cmsJournalSlug, isConsolidatedJournalSlug } from './seo-redirects';

/**
 * Resolves public journal slugs to links, in the order given.
 *
 * Only articles the API still publishes are returned, so unpublishing a guide
 * in the CMS removes its link instead of leaving a 404 behind.
 */
export async function journalGuideLinks(publicSlugs: string[]): Promise<RelatedLink[]> {
    const posts = await getBlogPosts();
    const bySlug = new Map(posts.filter(p => p.slug).map(p => [p.slug as string, p]));

    return publicSlugs.flatMap(publicSlug => {
        const post = bySlug.get(cmsJournalSlug(publicSlug));
        if (!post?.slug || isConsolidatedJournalSlug(post.slug)) return [];
        return [
            {
                href: `/journal/${publicSlug}`,
                label: journalSeo(post).headline,
                hint: cleanArticleText(post.excerpt ?? undefined),
            },
        ];
    });
}
