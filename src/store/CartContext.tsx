"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, SaleUnit } from '@/types';
import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CartItem {
    product: Product;
    saleUnit: SaleUnit;
    quantity: number;
    unitPrice: number;
}

export interface AppliedPromo {
    code: string;
    promotion_id: number;
    promotion_name: string;
    type: "percentage" | "fixed";
    value: number;
    discount: number;
}

export interface ShippingMethod {
    id: number;
    name: string;
    description: string | null;
    base_price: number;
    estimated_days_min: number;
    estimated_days_max: number;
    free_shipping_threshold: number | null;
}

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

    // Shipping — live from API
    selectedShipping: ShippingMethod | null;
    setShipping: (method: ShippingMethod) => void;
    shippingOptions: ShippingMethod[];
    shippingLoading: boolean;

    // Actions
    addToCart: (product: Product, saleUnit: SaleUnit, quantity?: number) => void;
    removeFromCart: (productId: string | number, saleUnitId: string | number) => void;
    updateQuantity: (productId: string | number, saleUnitId: string | number, quantity: number) => void;
    clearCart: () => void;
    syncCartToBackend: () => Promise<void>;
}

// ─── Context & Provider ────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cafrezzo_cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [cartHydrated, setCartHydrated] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<ShippingMethod[]>([]);
    const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
    const [shippingLoading, setShippingLoading] = useState(true);

    // ─── Load cart from localStorage on client mount (SSR-safe) ──────────
    useEffect(() => {
        try {
            const raw = localStorage.getItem(CART_STORAGE_KEY);
            if (raw) setItems(JSON.parse(raw) as CartItem[]);
        } catch { /* corrupt data — start fresh */ }
        setCartHydrated(true);
    }, []);

    // ─── Persist cart to localStorage (only after hydration) ─────────────
    useEffect(() => {
        if (!cartHydrated) return;
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch { /* quota exceeded or private browsing */ }
    }, [items, cartHydrated]);

    // ─── Fetch shipping methods from API on mount ──────────────────────────
    useEffect(() => {
        apiClient.get<ShippingMethod[]>(Endpoints.shippingMethods)
            .then(methods => {
                const active = Array.isArray(methods) ? methods : [];
                setShippingOptions(active);
                if (active.length > 0 && !selectedShipping) {
                    setSelectedShipping(active[0]);
                }
            })
            .catch(() => {
                // If API fails, leave options empty — checkout will handle error
                setShippingOptions([]);
            })
            .finally(() => setShippingLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Derived Pricing ───────────────────────────────────────────────────
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const promoDiscount = appliedPromo?.discount ?? 0;
    const afterDiscount = Math.max(0, subtotal - promoDiscount);

    // Free shipping threshold comes from the selected method (set by admin)
    const freeThreshold = selectedShipping?.free_shipping_threshold ?? null;
    const isFreeShipping = freeThreshold !== null && afterDiscount >= freeThreshold;
    const shippingCost = !selectedShipping ? 0 : isFreeShipping ? 0 : Number(selectedShipping.base_price);
    const amountToFreeShipping = freeThreshold ? Math.max(0, freeThreshold - afterDiscount) : 0;
    const total = afterDiscount + shippingCost;
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // ─── Actions ────────────────────────────────────────────────────────────

    const addToCart = useCallback((product: Product, saleUnit: SaleUnit, quantity = 1) => {
        const maxStock = Number(saleUnit.stock) || 0;
        if (maxStock <= 0) return;

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
        try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* ignore */ }
    }, []);

    // ─── Promo Code ─────────────────────────────────────────────────────────

    const applyPromoCode = useCallback(async (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) { setPromoError('Please enter a promo code.'); return; }

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
            }>(Endpoints.applyPromo, { code: trimmed, order_total: subtotal });

            if (res.valid) {
                setAppliedPromo({
                    code: trimmed.toUpperCase(),
                    promotion_id: res.promotion_id,
                    promotion_name: res.promotion_name,
                    type: res.discount_type,
                    value: res.discount_value,
                    discount: res.discount,
                });
            } else {
                setPromoError(res.message || 'Invalid promo code.');
            }
        } catch (err: unknown) {
            const apiErr = err as { message?: string };
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

    // ─── Sync local cart → backend (called before checkout) ─────────────────
    const syncCartToBackend = useCallback(async () => {
        console.log('[CartSync] items in state:', items);
        console.log('[CartSync] localStorage raw:', localStorage.getItem(CART_STORAGE_KEY));
        console.log('[CartSync] cartHydrated:', cartHydrated);

        if (items.length === 0) {
            console.warn('[CartSync] items array is EMPTY — nothing to sync');
            return;
        }

        // Best-effort clear — ignore error if no cart exists yet
        try {
            await apiClient.delete(Endpoints.cart);
            console.log('[CartSync] DELETE /cart OK');
        } catch (e) {
            console.warn('[CartSync] DELETE /cart failed (ignored):', e);
        }

        // Add each item — propagate errors so the checkout UI shows them
        for (const item of items) {
            const payload = {
                product_sales_unit_id: Number(item.saleUnit.id),
                quantity: item.quantity,
            };
            console.log('[CartSync] POST /cart/items payload:', payload);
            try {
                const res = await apiClient.post(Endpoints.cartAdd, payload);
                console.log('[CartSync] POST /cart/items OK:', res);
            } catch (e) {
                console.error('[CartSync] POST /cart/items FAILED:', e);
                throw e;
            }
        }

        console.log('[CartSync] sync complete — all items added');
    }, [items, cartHydrated]);

    return (
        <CartContext.Provider value={{
            items, cartCount, subtotal, promoDiscount,
            shippingCost, total, amountToFreeShipping,
            appliedPromo, promoError, promoLoading,
            applyPromoCode, removePromoCode,
            selectedShipping, setShipping, shippingOptions, shippingLoading,
            addToCart, removeFromCart, updateQuantity, clearCart, syncCartToBackend,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) throw new Error('useCart must be used within a CartProvider');
    return context;
}
