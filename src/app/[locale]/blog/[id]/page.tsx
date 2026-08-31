// Legacy route. Posts used to be addressed by numeric id under /blog; resolve
// the id to its slug and redirect permanently to the new /journal URL.
import { notFound, permanentRedirect } from 'next/navigation';

import { getBlogPost, probeApiReachable } from '@/lib/api/server';
import { toLocale } from '@/lib/i18n';

export const revalidate = 3600;

export default async function LegacyBlogPost({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = toLocale(rawLocale);
    const post = await getBlogPost(id);

    if (post?.slug) permanentRedirect(`/${locale}/journal/${post.slug}`);

    // Unknown id with a healthy API is a genuine 404; an outage falls back to
    // the listing rather than telling crawlers the post is gone.
    if (await probeApiReachable()) notFound();
    permanentRedirect(`/${locale}/journal`);
}
