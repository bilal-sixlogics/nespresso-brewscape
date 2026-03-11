/**
 * Public API client — connects the Next.js frontend to the Laravel backend.
 * Base: http://localhost:8001/api/v1/public
 *
 * Maps Laravel ProductResource → frontend Product type.
 */

import { Product, SaleUnit } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1/public';

// ─── Raw types from Laravel API ────────────────────────────────────────────────
interface ApiSaleUnit {
    id: number;
    sku: string;
    label: string;
    price: number;
    original_price: number | null;
    quantity: number;
    is_default: boolean;
}

interface ApiCategory {
    id: number;
    name: string;
    slug: string;
}

interface ApiTasteProfile {
    bitterness: number;
    acidity: number;
    roastiness: number;
    body: number;
    sweetness: number;
}

interface ApiProduct {
    id: number;
    slug: string;
    name: string;
    name_part2?: string;
    tagline?: string;
    description?: string;
    price: number;
    original_price: number | null;
    discount_percent: number | null;
    intensity?: number;
    origin?: string;
    roast_level?: string;
    average_rating: number;
    review_count: number;
    is_featured: boolean;
    is_new: boolean;
    in_stock: boolean;
    category?: ApiCategory;
    brand?: { id: number; name: string; logo: string | null };
    primary_image?: string;
    images?: Array<{ path: string; is_primary: boolean; sort_order: number }>;
    sale_units?: ApiSaleUnit[];
    taste_profile?: ApiTasteProfile;
    notes?: Array<{ note_text: string }>;
    brew_sizes?: Array<{ brew_size: string }>;
    tags?: Array<{ tag: string }>;
}

interface ApiMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ApiResponse<T> {
    data: T[];
    meta?: ApiMeta;
    links?: Record<string, string | null>;
}

// ─── Mapper: ApiProduct → frontend Product ─────────────────────────────────────
export function mapApiProduct(p: ApiProduct): Product {
    const saleUnits: SaleUnit[] | undefined = p.sale_units?.map(u => ({
        id: String(u.id),
        label: u.label,
        price: u.price,
        originalPrice: u.original_price ?? undefined,
        quantity: u.quantity,
    }));

    return {
        id: p.id,
        slug: p.slug,
        category: p.category?.name,
        brand: p.brand?.name,
        name: p.name,
        namePart2: p.name_part2,
        tagline: p.tagline,
        price: p.price,
        originalPrice: p.original_price ?? undefined,
        saleUnits: saleUnits?.length ? saleUnits : undefined,
        image: p.primary_image || p.images?.[0]?.path || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
        images: p.images?.map(i => i.path),
        intensity: p.intensity,
        tasteProfile: p.taste_profile,
        notes: p.notes?.map(n => n.note_text),
        brewSizes: p.brew_sizes?.map(b => b.brew_size),
        isFeatured: p.is_featured,
        isNew: p.is_new,
        averageRating: p.average_rating,
        desc: p.description,
        tags: p.tags?.map(t => t.tag),
    };
}

// ─── Fetch helpers ─────────────────────────────────────────────────────────────
async function get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${BASE}${path}`);
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                url.searchParams.set(k, String(v));
            }
        });
    }
    const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json', 'Accept-Language': 'fr' },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${url.pathname}`);
    return res.json() as Promise<T>;
}

// ─── Public API methods ────────────────────────────────────────────────────────
export const publicApi = {
    /** List products with optional filters */
    async products(params?: {
        category?: string;
        featured?: boolean;
        in_stock?: boolean;
        search?: string;
        sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
        per_page?: number;
        page?: number;
    }): Promise<{ products: Product[]; total: number; lastPage: number }> {
        try {
            const raw = await get<ApiResponse<ApiProduct>>('/products', {
                ...(params?.category && { category: params.category }),
                ...(params?.featured !== undefined && { featured: params.featured }),
                ...(params?.in_stock !== undefined && { in_stock: params.in_stock }),
                ...(params?.search && { search: params.search }),
                ...(params?.sort && { sort: params.sort }),
                per_page: params?.per_page ?? 48,
                ...(params?.page && { page: params.page }),
            });
            return {
                products: (raw.data || []).map(mapApiProduct),
                total: raw.meta?.total ?? 0,
                lastPage: raw.meta?.last_page ?? 1,
            };
        } catch {
            return { products: [], total: 0, lastPage: 1 };
        }
    },

    /** Get a single product by slug */
    async product(slug: string): Promise<Product | null> {
        try {
            const raw = await get<{ data: ApiProduct }>(`/products/${slug}`);
            return mapApiProduct(raw.data);
        } catch {
            return null;
        }
    },

    /** Get featured machines */
    async featuredMachines(): Promise<Product[]> {
        const { products } = await publicApi.products({ category: 'machines-a-cafe', featured: true, per_page: 10 });
        return products;
    },

    /** Get featured coffee products */
    async featuredCoffee(): Promise<Product[]> {
        const { products } = await publicApi.products({ featured: true, per_page: 12 });
        return products.filter(p => p.category !== 'Machines à Café' && p.category !== 'Accessoires');
    },

    /** Get products by category slug */
    async byCategory(categorySlug: string, perPage = 48): Promise<Product[]> {
        const { products } = await publicApi.products({ category: categorySlug, per_page: perPage });
        return products;
    },

    /** Get all categories */
    async categories(): Promise<Array<{ id: number; name: string; slug: string }>> {
        try {
            const raw = await get<{ data: ApiCategory[] }>('/categories');
            return raw.data || [];
        } catch {
            return [];
        }
    },
};

export default publicApi;
