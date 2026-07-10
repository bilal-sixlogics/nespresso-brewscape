"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, SaleUnit } from '@/types';
import { apiClient } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';
import { useSiteSettings } from '@/context/SiteSettingsContext';

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
    freeShippingThreshold: number | null;
    // VAT (inclusive) — the portion of the discounted subtotal that is VAT.
    // Informational only; since prices are tax-inclusive it does not change `total`.
    vatAmount: number;

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
    const { tax_rate: globalTaxRate, tax_included_in_price: taxIncluded } = useSiteSettings();
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

    // VAT (inclusive) — per-product rate, falling back to the global rate.
    // Discount is apportioned proportionally, mirroring the backend checkout math
    // so the number shown here matches the order's recorded tax_total exactly.
    const discountRatio = subtotal > 0 ? afterDiscount / subtotal : 0;
    const vatAmount = items.reduce((sum, item) => {
        const rate = item.product.vat_rate ?? globalTaxRate ?? 0;
        if (rate <= 0) return sum;
        const discountedGross = item.unitPrice * item.quantity * discountRatio;
        const lineVat = taxIncluded
            ? discountedGross * rate / (100 + rate)
            : discountedGross * rate / 100;
        return sum + lineVat;
    }, 0);

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

    // ─── Sync local cart → backend ───────────────────────────────────────────
    // Needed before both checkout AND promo code application — promotions are
    // evaluated server-side against the real cart contents (targets, stacking),
    // so a backend Cart record matching the current local state must exist.
    const syncCartToBackend = useCallback(async () => {
        if (items.length === 0) return;

        // Best-effort clear — ignore error if no cart exists yet
        try {
            await apiClient.delete(Endpoints.cart);
        } catch { /* no existing cart to clear — fine */ }

        // Add each item — propagate errors so the caller can surface them
        for (const item of items) {
            await apiClient.post(Endpoints.cartAdd, {
                product_sales_unit_id: Number(item.saleUnit.id),
                quantity: item.quantity,
            });
        }
    }, [items]);

    // ─── Promo Code ─────────────────────────────────────────────────────────

    const applyPromoCode = useCallback(async (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) { setPromoError('Please enter a promo code.'); return; }

        setPromoLoading(true);
        setPromoError(null);

        try {
            // Promo evaluation happens against the real backend cart (targets,
            // stackability) — make sure one exists and matches local state first.
            await syncCartToBackend();

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
    }, [subtotal, syncCartToBackend]);

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
            shippingCost, total, amountToFreeShipping, freeShippingThreshold: freeThreshold,
            vatAmount,
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
