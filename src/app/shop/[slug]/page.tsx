// Server Component — owns dynamic page for product detail.
// params is a Promise in Next.js 15+ and must be awaited.
import ProductDetailPageClient from './ProductDetailPageClient';

// Dynamic page — product slugs come from the API
export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    return <ProductDetailPageClient slug={slug} />;
}
