// Server Component — owns metadata and Article structured data for a journal post.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BlogPostClient from './BlogPostClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBlogPost, getBlogPosts, probeApiReachable } from '@/lib/api/server';
import { generateArticleSchema, generateBreadcrumbSchema, pageMetadata } from '@/lib/seo';
import { LOCALES, toLocale } from '@/lib/i18n';

export const revalidate = 3600;

/** Pre-render every published post in every locale; unknown slugs render on demand. */
export async function generateStaticParams() {
    const posts = await getBlogPosts();
    const slugs = posts.map(p => p.slug).filter((s): s is string => Boolean(s));
    return LOCALES.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

function toPlainText(html?: string | null): string | undefined {
    if (!html) return undefined;
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text || undefined;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale: rawLocale, slug } = await params;
    const locale = toLocale(rawLocale);
    const post = await getBlogPost(slug);

    if (!post) {
        return { title: 'Article introuvable', robots: { index: false, follow: true } };
    }

    const description =
        post.meta_description ?? post.excerpt ?? toPlainText(post.body)?.slice(0, 155) ?? '';

    return pageMetadata({
        locale,
        title: post.meta_title || post.title,
        description,
        path: `/journal/${slug}`,
        image: post.featured_image,
    });
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale: rawLocale, slug } = await params;
    const locale = toLocale(rawLocale);
    const post = await getBlogPost(slug);

    if (!post) {
        // Same reasoning as the product page: only 404 when the API is up and
        // genuinely has no such post, so an outage cannot deindex the journal.
        if (await probeApiReachable()) notFound();
        return <BlogPostClient slug={slug} />;
    }

    const articleSchema = generateArticleSchema({
        locale,
        title: post.title,
        description: post.meta_description ?? post.excerpt ?? toPlainText(post.body)?.slice(0, 200),
        slug,
        image: post.featured_image,
        author: post.author_name,
        publishedAt: post.published_at,
        updatedAt: post.updated_at,
    });

    const breadcrumbSchema = generateBreadcrumbSchema(locale, [
        { name: 'Accueil', url: '/' },
        { name: 'Journal', url: '/journal' },
        { name: post.title, url: `/journal/${slug}` },
    ]);

    return (
        <>
            <JsonLd schema={[articleSchema, breadcrumbSchema]} />
            <BlogPostClient slug={slug} />
        </>
    );
}
