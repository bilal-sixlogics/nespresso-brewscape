"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartContextType {
    cartCount: number;
    setCartCount: React.Dispatch<React.SetStateAction<number>>;
    addToCart: (quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartCount, setCartCount] = useState(0);

    const addToCart = (quantity: number) => {
        setCartCount(prev => prev + quantity);
    };

    return (
        <CartContext.Provider value={{ cartCount, setCartCount, addToCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
