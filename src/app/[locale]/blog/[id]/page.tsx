// Server Component — owns metadata and Article structured data for a blog post.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BlogPostClient from './BlogPostClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBlogPost, getBlogPosts, probeApiReachable } from '@/lib/api/server';
import { generateArticleSchema, generateBreadcrumbSchema, pageMetadata } from '@/lib/seo';
import { LOCALES, toLocale } from '@/lib/i18n';

export const revalidate = 3600;

/** Pre-render every published post in every locale; unknown ids render on demand. */
export async function generateStaticParams() {
    const posts = await getBlogPosts();
    const ids = posts.filter(p => p.id != null).map(p => String(p.id));
    return LOCALES.flatMap(locale => ids.map(id => ({ locale, id })));
}

function toPlainText(html?: string | null): string | undefined {
    if (!html) return undefined;
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text || undefined;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
    const { locale: rawLocale, id } = await params;
    const locale = toLocale(rawLocale);
    const post = await getBlogPost(id);

    if (!post) {
        return { title: 'Article introuvable', robots: { index: false, follow: true } };
    }

    const description =
        post.meta_description ?? post.excerpt ?? toPlainText(post.body)?.slice(0, 155) ?? '';

    return pageMetadata({
        locale,
        title: post.meta_title || post.title,
        description,
        path: `/blog/${id}`,
        image: post.featured_image,
    });
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = toLocale(rawLocale);
    const post = await getBlogPost(id);

    if (!post) {
        // Same reasoning as the product page: only 404 when the API is up and
        // genuinely has no such post, so an outage cannot deindex the blog.
        if (await probeApiReachable()) notFound();
        return <BlogPostClient id={id} />;
    }

    const articleSchema = generateArticleSchema({
        locale,
        title: post.title,
        description: post.meta_description ?? post.excerpt ?? toPlainText(post.body)?.slice(0, 200),
        id,
        image: post.featured_image,
        author: post.author_name,
        publishedAt: post.published_at,
        updatedAt: post.updated_at,
    });

    const breadcrumbSchema = generateBreadcrumbSchema(locale, [
        { name: 'Accueil', url: '/' },
        { name: 'Journal', url: '/blog' },
        { name: post.title, url: `/blog/${id}` },
    ]);

    return (
        <>
            <JsonLd schema={[articleSchema, breadcrumbSchema]} />
            <BlogPostClient id={id} />
        </>
    );
}
