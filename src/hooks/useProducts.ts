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

const CACHE_PREFIX = 'products_cache_';
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

interface CacheEntry {
    products: Product[];
    meta: PaginationMeta | null;
    ts: number;
}

function readCache(key: string): CacheEntry | null {
    try {
        const raw = sessionStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() - entry.ts > CACHE_TTL_MS) {
            sessionStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return entry;
    } catch {
        return null;
    }
}

function writeCache(key: string, products: Product[], meta: PaginationMeta | null) {
    try {
        const entry: CacheEntry = { products, meta, ts: Date.now() };
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
        // Storage full or unavailable — silently skip
    }
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
 * - sessionStorage cache restores last results instantly on back-navigation,
 *   while a background refresh keeps data fresh (2-minute TTL).
 */
export function useProducts(params: ProductQueryParams = {}): UseProductsResult {
    // Stable string key — only changes when param values actually differ
    const paramKey = JSON.stringify(params);

    // Seed initial state from cache so back-navigation shows data immediately
    const [products, setProducts] = useState<Product[]>(() => readCache(paramKey)?.products ?? []);
    const [meta, setMeta] = useState<PaginationMeta | null>(() => readCache(paramKey)?.meta ?? null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

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

            const newProducts = append ? (prev: Product[]) => [...prev, ...res.data] : () => res.data;
            setProducts(newProducts);
            setMeta(res.meta);

            // Only cache page-1 results (the canonical list for this param set)
            if (pageNum === 1) {
                writeCache(paramKey, res.data, res.meta);
            }
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

    // When params change: reset page to 1 and fetch.
    // If cached data was loaded as initial state, isLoading=true but the grid
    // already has content — no empty flash.
    useEffect(() => {
        setPage(1);
        // Restore cache for the new param set so the grid isn't cleared
        const cached = readCache(paramKey);
        if (cached) {
            setProducts(cached.products);
            setMeta(cached.meta);
        }
        fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
