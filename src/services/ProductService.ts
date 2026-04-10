/**
 * ProductService — all product-related API calls.
 * Connects to the Laravel backend at /api/v1/products.
 */

import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';
import { PaginatedResponse, ApiResponse, ProductQueryParams } from '@/lib/api/types';
import { Product } from '@/types';

export const ProductService = {
    /**
     * Fetch a paginated list of products.
     * Supports filtering by category, brand, price range, intensity, tags, stock, and sorting.
     */
    async getProducts(params: ProductQueryParams = {}): Promise<PaginatedResponse<Product>> {
        // Convert tags array to comma-separated if needed
        const apiParams: Record<string, string | number | boolean | undefined | null> = {};

        if (params.page) apiParams.page = params.page;
        if (params.per_page) apiParams.per_page = params.per_page;
        if (params.category) apiParams.category = params.category;
        if (params.category_id) apiParams.category_id = params.category_id;
        if (params.brand) apiParams.brand = params.brand;
        if (params.brand_id) apiParams.brand_id = params.brand_id;
        if (params.search) apiParams.search = params.search;
        if (params.min_price != null) apiParams.min_price = params.min_price;
        if (params.max_price != null) apiParams.max_price = params.max_price;
        if (params.in_stock) apiParams.in_stock = true;
        if (params.sort_by) apiParams.sort_by = params.sort_by;
        if (params.tags) apiParams.tags = params.tags;
        if (params.tag) apiParams.tag = params.tag;
        if (params.intensity_min != null) apiParams.intensity_min = params.intensity_min;
        if (params.intensity_max != null) apiParams.intensity_max = params.intensity_max;
        if (params.featured) apiParams.featured = true;
        if (params.storefront_page) apiParams.storefront_page = params.storefront_page;

        return apiClient.get<PaginatedResponse<Product>>(Endpoints.products, { params: apiParams });
    },

    /**
     * Fetch a single product by slug (includes reviews, sections, etc.).
     */
    async getProduct(slug: string): Promise<Product> {
        const res = await apiClient.get<ApiResponse<Product>>(Endpoints.product(slug));
        return res.data;
    },

    /**
     * Fetch featured products.
     */
    async getFeatured(): Promise<Product[]> {
        const res = await apiClient.get<{ data: Product[] }>(Endpoints.products + '/featured');
        return res.data;
    },
};
