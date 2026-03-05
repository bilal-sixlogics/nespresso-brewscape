/**
 * ProductService — all product-related API calls.
 * Uses dummy data fallback when API is unavailable (NEXT_PUBLIC_USE_MOCK=true or API offline).
 */

import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';
import { PaginatedResponse, ApiResponse, ProductQueryParams } from '@/lib/api/types';
import { Product } from '@/types';
import { enrichedProducts } from '@/lib/productsData';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || process.env.NODE_ENV === 'development';
const MOCK_DELAY = 600; // ms — simulates realistic network latency

function simulateDelay() {
    return new Promise(r => setTimeout(r, MOCK_DELAY));
}

function buildMockPaginatedResponse<T>(items: T[], page: number, perPage: number): PaginatedResponse<T> {
    const total = items.length;
    const lastPage = Math.ceil(total / perPage);
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);
    const data = items.slice((page - 1) * perPage, page * perPage);
    return {
        data,
        links: {
            first: null, last: null,
            prev: page > 1 ? `?page=${page - 1}` : null,
            next: page < lastPage ? `?page=${page + 1}` : null,
        },
        meta: { current_page: page, from, to, last_page: lastPage, per_page: perPage, total, path: '/products' },
    };
}

export const ProductService = {
    /**
     * Fetch a paginated list of products.
     * Applies category/search/price/stock filters.
     */
    async getProducts(params: ProductQueryParams = {}): Promise<PaginatedResponse<Product>> {
        if (USE_MOCK) {
            await simulateDelay();
            let filtered = [...enrichedProducts] as Product[];
            if (params.category) filtered = filtered.filter(p => p.category === params.category);
            if (params.search) {
                const q = params.search.toLowerCase();
                filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
            }
            if (params.in_stock) filtered = filtered.filter(p => p.inStock !== false);
            if (params.intensity_min) filtered = filtered.filter(p => (p.intensity ?? 0) >= params.intensity_min!);
            if (params.intensity_max) filtered = filtered.filter(p => (p.intensity ?? 14) <= params.intensity_max!);
            if (params.min_price) filtered = filtered.filter(p => p.price >= params.min_price!);
            if (params.max_price) filtered = filtered.filter(p => p.price <= params.max_price!);
            return buildMockPaginatedResponse(filtered, params.page ?? 1, params.per_page ?? 12);
        }

        return apiClient.get<PaginatedResponse<Product>>(Endpoints.products, { params: params as Record<string, string | number | boolean | undefined | null> });
    },

    /**
     * Fetch a single product by slug.
     */
    async getProduct(slug: string): Promise<Product> {
        if (USE_MOCK) {
            await simulateDelay();
            const product = (enrichedProducts as Product[]).find(p => p.slug === slug || String(p.id) === slug);
            if (!product) throw { message: 'Product not found', status: 404 };
            return product;
        }
        const res = await apiClient.get<ApiResponse<Product>>(Endpoints.product(slug));
        return res.data;
    },
};
