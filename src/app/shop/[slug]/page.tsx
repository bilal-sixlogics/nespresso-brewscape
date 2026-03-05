// Server Component — owns generateStaticParams for Next.js static export.
// params is a Promise in Next.js 15+ and must be awaited.
import { enrichedProducts } from '@/lib/productsData';
import ProductDetailPageClient from './ProductDetailPageClient';

export function generateStaticParams() {
    return enrichedProducts.map(p => ({ slug: p.slug ?? String(p.id) }));
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    return <ProductDetailPageClient slug={slug} />;
}
