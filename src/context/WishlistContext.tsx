"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';
import { useAuth } from '@/context/AuthContext';

interface WishlistContextType {
    wishlist: Product[];
    isLoading: boolean;
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    isWishlisted: (productId: number) => boolean;
    toggleWishlist: (product: Product) => Promise<void>;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LS_KEY = 'cafrezzo-wishlist-guest';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isHydrating } = useAuth();
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // ── Load wishlist ─────────────────────────────────────────────────────
    useEffect(() => {
        if (isHydrating) return;

        if (isAuthenticated) {
            setIsLoading(true);
            apiClient.get<{ data: Product[] }>(Endpoints.wishlist)
                .then(res => setWishlist(res.data))
                .catch(() => setWishlist([]))
                .finally(() => setIsLoading(false));
        } else {
            // Guest: load from localStorage
            try {
                const saved = localStorage.getItem(LS_KEY);
                if (saved) setWishlist(JSON.parse(saved));
            } catch { /* ignore */ }
        }
    }, [isAuthenticated, isHydrating]);

    // Persist guest wishlist to localStorage
    const saveGuest = useCallback((items: Product[]) => {
        setWishlist(items);
        try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch { /* ignore */ }
    }, []);

    // ── Add ───────────────────────────────────────────────────────────────
    const addToWishlist = useCallback(async (product: Product) => {
        if (wishlist.some(p => p.id === product.id)) return;

        if (isAuthenticated) {
            await apiClient.post(Endpoints.wishlist, { product_id: product.id });
            setWishlist(prev => [...prev, product]);
        } else {
            saveGuest([...wishlist, product]);
        }
    }, [isAuthenticated, wishlist, saveGuest]);

    // ── Remove ────────────────────────────────────────────────────────────
    const removeFromWishlist = useCallback(async (productId: number) => {
        if (isAuthenticated) {
            await apiClient.delete(Endpoints.wishlistItem(productId));
            setWishlist(prev => prev.filter(p => p.id !== productId));
        } else {
            saveGuest(wishlist.filter(p => p.id !== productId));
        }
    }, [isAuthenticated, wishlist, saveGuest]);

    // ── Toggle ────────────────────────────────────────────────────────────
    const toggleWishlist = useCallback(async (product: Product) => {
        if (wishlist.some(p => p.id === product.id)) {
            await removeFromWishlist(product.id);
        } else {
            await addToWishlist(product);
        }
    }, [wishlist, addToWishlist, removeFromWishlist]);

    const isWishlisted = useCallback((productId: number) =>
        wishlist.some(p => p.id === productId), [wishlist]);

    return (
        <WishlistContext.Provider value={{
            wishlist,
            isLoading,
            addToWishlist,
            removeFromWishlist,
            isWishlisted,
            toggleWishlist,
            wishlistCount: wishlist.length,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
    return ctx;
}
