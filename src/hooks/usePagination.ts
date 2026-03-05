import { useState, useCallback } from 'react';

/**
 * usePagination — shows items in full-row batches.
 *
 * The displayed count is always snapped to a multiple of `itemsPerPage`, so the
 * product grid never has an orphaned partial last row (e.g. 9 items in a 4-col
 * grid would leave one item dangling). We only show the true remainder on the
 * very last "load", after which `hasMore` becomes false.
 */
export function usePagination<T>(items: T[], itemsPerPage = 8) {
    const [visibleCount, setVisibleCount] = useState(itemsPerPage);
    const [isLoading, setIsLoading] = useState(false);

    const loadMore = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            setVisibleCount(prev => {
                const next = prev + itemsPerPage;
                // If loading everything would leave a partial row and more still
                // remain, snap to the next clean multiple. Otherwise just load all.
                return next >= items.length ? items.length : next;
            });
            setIsLoading(false);
        }, 700);
    }, [itemsPerPage, items.length]);

    const reset = useCallback(() => {
        setVisibleCount(itemsPerPage);
    }, [itemsPerPage]);

    const displayedItems = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;
    const totalCount = items.length;

    return { displayedItems, hasMore, isLoading, loadMore, reset, totalCount };
}
