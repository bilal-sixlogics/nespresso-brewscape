"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';

const MAX_ITEMS = 8;
const STORAGE_KEY = 'cf_recently_viewed';

interface RecentlyViewedContextType {
    recentlyViewed: Product[];
    addRecentlyViewed: (product: Product) => void;
    clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType>({
    recentlyViewed: [],
    addRecentlyViewed: () => { },
    clearRecentlyViewed: () => { },
});

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setRecentlyViewed(JSON.parse(stored));
        } catch { }
    }, []);

    const addRecentlyViewed = useCallback((product: Product) => {
        setRecentlyViewed(prev => {
            // Remove existing entry if present, prepend new one, cap at MAX_ITEMS
            const filtered = prev.filter(p => p.id !== product.id);
            const updated = [product, ...filtered].slice(0, MAX_ITEMS);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { }
            return updated;
        });
    }, []);

    const clearRecentlyViewed = useCallback(() => {
        setRecentlyViewed([]);
        try { localStorage.removeItem(STORAGE_KEY); } catch { }
    }, []);

    return (
        <RecentlyViewedContext.Provider value={{ recentlyViewed, addRecentlyViewed, clearRecentlyViewed }}>
            {children}
        </RecentlyViewedContext.Provider>
    );
}

export function useRecentlyViewed() {
    return useContext(RecentlyViewedContext);
}
