import BlogPostClient from './BlogPostClient';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BlogPostClient id={id} />;
}
