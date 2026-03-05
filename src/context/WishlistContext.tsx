"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string | number) => void;
    isWishlisted: (productId: string | number) => boolean;
    toggleWishlist: (product: Product) => void;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('cafrezzo-wishlist');
            if (saved) setWishlist(JSON.parse(saved));
        } catch (e) { }
    }, []);

    const save = (items: Product[]) => {
        setWishlist(items);
        try { localStorage.setItem('cafrezzo-wishlist', JSON.stringify(items)); } catch (e) { }
    };

    const addToWishlist = (product: Product) => {
        if (!wishlist.find(p => p.id === product.id)) save([...wishlist, product]);
    };

    const removeFromWishlist = (productId: string | number) => {
        save(wishlist.filter(p => p.id !== productId));
    };

    const isWishlisted = (productId: string | number) => wishlist.some(p => p.id === productId);

    const toggleWishlist = (product: Product) => {
        isWishlisted(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
    };

    return (
        <WishlistContext.Provider value={{
            wishlist, addToWishlist, removeFromWishlist, isWishlisted, toggleWishlist,
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
