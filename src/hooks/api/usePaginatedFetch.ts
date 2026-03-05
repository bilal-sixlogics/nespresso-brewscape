/**
 * usePaginatedFetch — generic hook for any Laravel-paginated API endpoint.
 *
 * Usage:
 *   const { data, meta, isLoading, hasMore, loadMore } = usePaginatedFetch(
 *     (params) => ProductService.getProducts(params),
 *     { per_page: 12 }
 *   );
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PaginatedResponse, PaginationMeta, ApiError, PaginationParams } from '@/lib/api/types';

interface UsePaginatedFetchOptions<P extends PaginationParams> {
    initialParams?: Omit<P, 'page'>;
    initialPage?: number;
    enabled?: boolean;           // Set to false to skip initial fetch
}

interface UsePaginatedFetchReturn<T> {
    data: T[];
    meta: PaginationMeta | null;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: ApiError | null;
    hasMore: boolean;
    loadMore: () => void;
    refresh: () => void;
    setParams: (params: Omit<PaginationParams, 'page'>) => void;
}

export function usePaginatedFetch<T, P extends PaginationParams = PaginationParams>(
    fetchFn: (params: P) => Promise<PaginatedResponse<T>>,
    options: UsePaginatedFetchOptions<P> = {}
): UsePaginatedFetchReturn<T> {
    const { initialParams = {}, initialPage = 1, enabled = true } = options;

    const [data, setData] = useState<T[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [page, setPage] = useState(initialPage);
    const [params, setParamsState] = useState<Omit<P, 'page'>>(initialParams as Omit<P, 'page'>);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const abortRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async (pageNum: number, currentParams: Omit<P, 'page'>, append = false) => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        if (append) setIsLoadingMore(true);
        else setIsLoading(true);
        setError(null);

        try {
            const result = await fetchFn({ ...currentParams, page: pageNum } as P);
            setMeta(result.meta);
            setData(prev => append ? [...prev, ...result.data] : result.data);
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                setError(err as ApiError);
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [fetchFn]);

    // Initial fetch and when params change — reset to page 1
    useEffect(() => {
        if (!enabled) return;
        setPage(1);
        fetchData(1, params, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, JSON.stringify(params)]);

    const loadMore = useCallback(() => {
        if (!meta || page >= meta.last_page || isLoadingMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchData(nextPage, params, true);
    }, [meta, page, params, isLoadingMore, fetchData]);

    const refresh = useCallback(() => {
        setPage(1);
        setData([]);
        fetchData(1, params, false);
    }, [params, fetchData]);

    const setParams = useCallback((newParams: Omit<PaginationParams, 'page'>) => {
        setParamsState(newParams as Omit<P, 'page'>);
    }, []);

    const hasMore = !!meta && page < meta.last_page;

    return { data, meta, isLoading, isLoadingMore, error, hasMore, loadMore, refresh, setParams };
}
