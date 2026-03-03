import { useState, useCallback } from 'react';

export function usePagination<T>(items: T[], itemsPerPage = 8) {
    const [visibleCount, setVisibleCount] = useState(itemsPerPage);
    const [isLoading, setIsLoading] = useState(false);

    const loadMore = useCallback(() => {
        setIsLoading(true);
        // Simulate network request or heavy rendering
        setTimeout(() => {
            setVisibleCount(prev => prev + itemsPerPage);
            setIsLoading(false);
        }, 800); // 800ms delay to show loader
    }, [itemsPerPage]);

    const reset = useCallback(() => {
        setVisibleCount(itemsPerPage);
    }, [itemsPerPage]);

    const displayedItems = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;
    const totalCount = items.length;

    return {
        displayedItems,
        hasMore,
        isLoading,
        loadMore,
        reset,
        totalCount
    };
}
