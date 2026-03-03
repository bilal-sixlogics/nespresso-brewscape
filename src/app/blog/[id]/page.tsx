import BlogPostClient from './BlogPostClient';

export function generateStaticParams() {
    return [{ id: '1' }, { id: '2' }];
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BlogPostClient id={id} />;
}
