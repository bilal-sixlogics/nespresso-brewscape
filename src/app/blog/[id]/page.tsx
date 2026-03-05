import { blogPosts } from '@/lib/blogsData';
import BlogPostClient from './BlogPostClient';

export function generateStaticParams() {
    return blogPosts.map(post => ({ id: String(post.id) }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BlogPostClient id={id} />;
}
