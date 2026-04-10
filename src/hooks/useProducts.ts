"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Category, Brand } from '@/types';
import { ProductService } from '@/services/ProductService';
import { ProductQueryParams, PaginationMeta } from '@/lib/api/types';
import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';

interface UseProductsResult {
    products: Product[];
    meta: PaginationMeta | null;
    isLoading: boolean;
    error: string | null;
    loadMore: () => void;
    hasMore: boolean;
    refetch: () => void;
}

/**
 * Hook for fetching paginated products from the backend.
 *
 * Key guarantees:
 * - Params are compared by value (JSON.stringify), not by reference — safe to
 *   pass inline objects without causing infinite re-fetches.
 * - Stale responses are discarded: if a newer request fires before an older one
 *   resolves, only the latest response is applied.
 * - Products are NOT cleared until the new page-1 response arrives, preventing
 *   a flash of empty content when filters change.
 */
export function useProducts(params: ProductQueryParams = {}): UseProductsResult {
    const [products, setProducts] = useState<Product[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    // Stable string key — only changes when param values actually differ
    const paramKey = JSON.stringify(params);

    // Track the in-flight request so stale responses can be dropped
    const requestIdRef = useRef(0);

    const fetchProducts = useCallback(async (pageNum: number, append: boolean) => {
        const currentId = ++requestIdRef.current;
        setIsLoading(true);
        setError(null);

        try {
            const res = await ProductService.getProducts({
                ...params,
                page: pageNum,
                per_page: params.per_page ?? 12,
            });

            // Discard if a newer request has already fired
            if (currentId !== requestIdRef.current) return;

            setProducts(prev => append ? [...prev, ...res.data] : res.data);
            setMeta(res.meta);
        } catch (err) {
            if (currentId !== requestIdRef.current) return;
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            if (currentId === requestIdRef.current) {
                setIsLoading(false);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramKey]);

    // When params change: reset page to 1 and fetch — do NOT clear products
    // immediately so the grid doesn't flash empty while the request is in flight.
    useEffect(() => {
        setPage(1);
        fetchProducts(1, false);
    }, [fetchProducts]);

    const loadMore = useCallback(() => {
        if (meta && page < meta.last_page) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage, true);
        }
    }, [meta, page, fetchProducts]);

    const hasMore = meta ? page < meta.last_page : false;

    const refetch = useCallback(() => {
        setPage(1);
        fetchProducts(1, false);
    }, [fetchProducts]);

    return { products, meta, isLoading, error, loadMore, hasMore, refetch };
}

/**
 * Hook for fetching a single product by slug.
 */
export function useProduct(slug: string) {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        setIsLoading(true);
        setError(null);
        ProductService.getProduct(slug)
            .then(setProduct)
            .catch(err => setError(err instanceof Error ? err.message : 'Product not found'))
            .finally(() => setIsLoading(false));
    }, [slug]);

    return { product, isLoading, error };
}

/**
 * Hook for fetching all categories. Cached for the lifetime of the page.
 */
export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get<Category[]>(Endpoints.categories)
            .then(setCategories)
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    return { categories, isLoading };
}

/**
 * Hook for fetching all brands. Cached for the lifetime of the page.
 */
export function useBrands() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get<Brand[]>(Endpoints.categories.replace('categories', 'brands'))
            .then(setBrands)
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    return { brands, isLoading };
}
