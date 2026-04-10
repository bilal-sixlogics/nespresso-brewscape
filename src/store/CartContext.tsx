"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product, SaleUnit } from '@/types';
import { AppConfig } from '@/lib/config';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CartItem {
    product: Product;
    saleUnit: SaleUnit; // Which pack/unit was selected (e.g., "Lot de 50")
    quantity: number;   // Number of that unit
    unitPrice: number;  // Effective price per unit after any product-level discount
}

export interface AppliedPromo {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    label: string;
}

export interface ShippingMethod {
    id: "standard" | "express";
    label: string;
    labelEn: string;
    price: number;
}

interface CartContextType {
    // Cart Data
    items: CartItem[];
    cartCount: number; // Total item quantity for badge

    // Pricing
    subtotal: number;
    sitewideDiscount: number;   // Amount saved from sitewide %
    promoDiscount: number;      // Amount saved from promo code
    shippingCost: number;
    total: number;
    amountToFreeShipping: number; // Remaining amount to unlock free shipping (0 if already free)

    // Promo Code
    appliedPromo: AppliedPromo | null;
    promoError: string | null;
    applyPromoCode: (code: string) => void;
    removePromoCode: () => void;

    // Shipping
    selectedShipping: ShippingMethod;
    setShipping: (method: ShippingMethod) => void;

    // Actions
    addToCart: (product: Product, saleUnit: SaleUnit, quantity?: number) => void;
    removeFromCart: (productId: string | number, saleUnitId: string | number) => void;
    updateQuantity: (productId: string | number, saleUnitId: string | number, quantity: number) => void;
    clearCart: () => void;
}

// ─── Context & Provider ────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(
        AppConfig.shipping.standard,
    );

    // ─── Derived Pricing ───────────────────────────────────────────────────
    // Final price validation happens server-side at checkout.
    // Client subtotal uses the unit price captured at add-to-cart time.
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.unitPrice * item.quantity);
    }, 0);

    // Sitewide discount (admin-toggled)
    const sitewideDiscountPct = AppConfig.promo.sitewideDiscount.enabled
        ? AppConfig.promo.sitewideDiscount.percentage / 100
        : 0;
    const sitewideDiscount = subtotal * sitewideDiscountPct;

    // Promo code discount (applied on top of sitewide-discounted price)
    const afterSitewide = subtotal - sitewideDiscount;
    let promoDiscount = 0;
    if (appliedPromo) {
        promoDiscount = appliedPromo.type === "percentage"
            ? afterSitewide * (appliedPromo.value / 100)
            : Math.min(appliedPromo.value, afterSitewide); // Don't discount below 0
    }

    const afterAllDiscounts = afterSitewide - promoDiscount;
    const freeShippingThreshold = AppConfig.promo.freeShippingThreshold;
    const isFreeShipping = afterAllDiscounts >= freeShippingThreshold;
    const shippingCost = isFreeShipping ? 0 : selectedShipping.price;
    const amountToFreeShipping = Math.max(0, freeShippingThreshold - afterAllDiscounts);
    const total = afterAllDiscounts + shippingCost;
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // ─── Actions ────────────────────────────────────────────────────────────

    const addToCart = useCallback((product: Product, saleUnit: SaleUnit, quantity = 1) => {
        setItems(prev => {
            const existingIdx = prev.findIndex(
                i => i.product.id === product.id && i.saleUnit.id === saleUnit.id
            );
            // Compute effective unit price (ensure number since API may return string)
            const unitPrice = Number(saleUnit.selling_price) || 0;

            if (existingIdx > -1) {
                const next = [...prev];
                next[existingIdx] = {
                    ...next[existingIdx],
                    quantity: next[existingIdx].quantity + quantity,
                };
                return next;
            }
            return [...prev, { product, saleUnit, quantity, unitPrice }];
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
        setItems(prev => prev.map(item =>
            item.product.id === productId && item.saleUnit.id === saleUnitId
                ? { ...item, quantity }
                : item
        ));
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setItems([]);
        setAppliedPromo(null);
        setPromoError(null);
    }, []);

    const applyPromoCode = useCallback((code: string) => {
        const trimmed = code.trim().toUpperCase();
        const found = AppConfig.promo.promoCodes[trimmed];
        if (found) {
            setAppliedPromo({ code: trimmed, ...found });
            setPromoError(null);
        } else {
            setPromoError("Code invalide ou expiré.");
        }
    }, []);

    const removePromoCode = useCallback(() => {
        setAppliedPromo(null);
        setPromoError(null);
    }, []);

    const setShipping = useCallback((method: ShippingMethod) => {
        setSelectedShipping(method);
    }, []);

    return (
        <CartContext.Provider value={{
            items, cartCount, subtotal, sitewideDiscount, promoDiscount,
            shippingCost, total, amountToFreeShipping, appliedPromo, promoError,
            applyPromoCode, removePromoCode, selectedShipping, setShipping,
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
