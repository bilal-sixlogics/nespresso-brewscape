/**
 * useProducts — product list hook backed by ProductService.
 * Supports filtering, pagination (load more), and infinite scroll.
 */

import { usePaginatedFetch } from './usePaginatedFetch';
import { ProductService } from '@/services/ProductService';
import { Product } from '@/types';
import { ProductQueryParams } from '@/lib/api/types';

export function useProducts(params: Omit<ProductQueryParams, 'page'> = {}) {
    return usePaginatedFetch<Product, ProductQueryParams>(
        ProductService.getProducts.bind(ProductService),
        { initialParams: params, initialPage: 1 }
    );
}
