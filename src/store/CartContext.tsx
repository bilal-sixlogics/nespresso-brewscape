"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product, SaleUnit } from '@/types';
import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CartItem {
    product: Product;
    saleUnit: SaleUnit; // Which pack/unit was selected (e.g., "Lot de 50")
    quantity: number;   // Number of that unit
    unitPrice: number;  // Effective price per unit after any product-level discount
}

export interface AppliedPromo {
    code: string;
    promotion_id: number;
    promotion_name: string;
    type: "percentage" | "fixed";
    value: number;
    discount: number; // pre-calculated discount amount from backend
}

export interface ShippingMethod {
    id: "standard" | "express";
    label: string;
    labelEn: string;
    price: number;
}

const DEFAULT_SHIPPING: ShippingMethod = {
    id: 'standard',
    label: 'Standard (3–5 jours)',
    labelEn: 'Standard (3–5 days)',
    price: 5.99,
};

const EXPRESS_SHIPPING: ShippingMethod = {
    id: 'express',
    label: 'Express (1–2 jours)',
    labelEn: 'Express (1–2 days)',
    price: 12.99,
};

interface CartContextType {
    // Cart Data
    items: CartItem[];
    cartCount: number;

    // Pricing
    subtotal: number;
    promoDiscount: number;
    shippingCost: number;
    total: number;
    amountToFreeShipping: number;

    // Promo Code
    appliedPromo: AppliedPromo | null;
    promoError: string | null;
    promoLoading: boolean;
    applyPromoCode: (code: string) => Promise<void>;
    removePromoCode: () => void;

    // Shipping
    selectedShipping: ShippingMethod;
    setShipping: (method: ShippingMethod) => void;
    shippingOptions: ShippingMethod[];

    // Actions
    addToCart: (product: Product, saleUnit: SaleUnit, quantity?: number) => void;
    removeFromCart: (productId: string | number, saleUnitId: string | number) => void;
    updateQuantity: (productId: string | number, saleUnitId: string | number, quantity: number) => void;
    clearCart: () => void;
}

// ─── Context & Provider ────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 150; // €150

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(DEFAULT_SHIPPING);

    // ─── Derived Pricing ───────────────────────────────────────────────────
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    // Promo discount comes from backend calculation
    const promoDiscount = appliedPromo?.discount ?? 0;

    const afterDiscount = Math.max(0, subtotal - promoDiscount);
    const isFreeShipping = afterDiscount >= FREE_SHIPPING_THRESHOLD;
    const shippingCost = isFreeShipping ? 0 : selectedShipping.price;
    const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount);
    const total = afterDiscount + shippingCost;
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // ─── Actions ────────────────────────────────────────────────────────────

    const addToCart = useCallback((product: Product, saleUnit: SaleUnit, quantity = 1) => {
        const maxStock = Number(saleUnit.stock) || 0;
        if (maxStock <= 0) return; // Out of stock — block add

        setItems(prev => {
            const existingIdx = prev.findIndex(
                i => i.product.id === product.id && i.saleUnit.id === saleUnit.id
            );
            const unitPrice = Number(saleUnit.selling_price) || 0;
            const currentQty = existingIdx > -1 ? prev[existingIdx].quantity : 0;
            const newQty = Math.min(currentQty + quantity, maxStock);

            if (existingIdx > -1) {
                const next = [...prev];
                next[existingIdx] = { ...next[existingIdx], quantity: newQty };
                return next;
            }
            return [...prev, { product, saleUnit, quantity: Math.min(quantity, maxStock), unitPrice }];
        });
    }, []);

    const removeFromCart = useCallback((productId: string | number, saleUnitId: string | number) => {
        setItems(prev => prev.filter(
            i => !(i.product.id === productId && i.saleUnit.id === saleUnitId)
        ));
    }, []);

    const updateQuantity = useCallback((productId: string | number, saleUnitId: string | number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId, saleUnitId);
            return;
        }
        setItems(prev => prev.map(item => {
            if (item.product.id === productId && item.saleUnit.id === saleUnitId) {
                const maxStock = Number(item.saleUnit.stock) || Infinity;
                return { ...item, quantity: Math.min(quantity, maxStock) };
            }
            return item;
        }));
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setItems([]);
        setAppliedPromo(null);
        setPromoError(null);
    }, []);

    // ─── Promo Code — calls backend API ─────────────────────────────────────

    const applyPromoCode = useCallback(async (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) {
            setPromoError('Please enter a promo code.');
            return;
        }

        setPromoLoading(true);
        setPromoError(null);

        try {
            const res = await apiClient.post<{
                valid: boolean;
                promotion_id: number;
                promotion_name: string;
                discount_type: 'percentage' | 'fixed';
                discount_value: number;
                discount: number;
                message?: string;
            }>(Endpoints.applyPromo, {
                code: trimmed,
                order_total: subtotal,
            });

            if (res.valid) {
                setAppliedPromo({
                    code: trimmed.toUpperCase(),
                    promotion_id: res.promotion_id,
                    promotion_name: res.promotion_name,
                    type: res.discount_type,
                    value: res.discount_value,
                    discount: res.discount,
                });
                setPromoError(null);
            } else {
                setPromoError(res.message || 'Invalid promo code.');
            }
        } catch (err: unknown) {
            const apiErr = err as { message?: string; status?: number };
            setPromoError(apiErr.message || 'Invalid or expired promo code.');
        } finally {
            setPromoLoading(false);
        }
    }, [subtotal]);

    const removePromoCode = useCallback(() => {
        setAppliedPromo(null);
        setPromoError(null);
    }, []);

    const setShipping = useCallback((method: ShippingMethod) => {
        setSelectedShipping(method);
    }, []);

    return (
        <CartContext.Provider value={{
            items, cartCount, subtotal, promoDiscount,
            shippingCost, total, amountToFreeShipping, appliedPromo, promoError,
            promoLoading, applyPromoCode, removePromoCode,
            selectedShipping, setShipping, shippingOptions: [DEFAULT_SHIPPING, EXPRESS_SHIPPING],
            addToCart, removeFromCart, updateQuantity, clearCart,
        }}>
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
