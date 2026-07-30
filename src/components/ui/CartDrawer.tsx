"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, Truck, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFormatPrice } from '@/context/SiteSettingsContext';
import { getProductImage } from '@/types';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const {
        items, cartCount, subtotal, promoDiscount,
        amountToFreeShipping, freeShippingThreshold,
        appliedPromo, promoError, promoLoading, applyPromoCode, removePromoCode,
        removeFromCart, updateQuantity, clearCart,
    } = useCart();
    const { language } = useLanguage();
    const formatPrice = useFormatPrice();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;

    const [promoInput, setPromoInput] = useState('');
    const [promoExpanded, setPromoExpanded] = useState(false);

    // Portals require a DOM node — only available once mounted on the client.
    const [mounted, setMounted] = useState(false);
    React.useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const freeShippingProgress = freeShippingThreshold
        ? Math.min(100, ((subtotal - promoDiscount) / freeShippingThreshold) * 100)
        : 0;

    const handleApplyPromo = () => {
        if (promoInput.trim()) applyPromoCode(promoInput.trim());
    };

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[30000]"
                    />
                )}
            </AnimatePresence>

            {/* Drawer */}
            <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: open ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-sand z-[30001] flex flex-col shadow-2xl"
            >
                {/* ── Header ──────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/15 rounded-full flex items-center justify-center">
                            <ShoppingBag size={18} className="text-gold" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-widest text-ink">{tx('Mon Panier', 'My Cart')}</p>
                            <p className="text-xs text-ink/50 font-bold">{cartCount} {tx('article(s)', 'item(s)')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {items.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-[9px] font-bold uppercase tracking-wider text-ink/40 hover:text-red-400 transition-colors"
                            >
                                {tx('Vider', 'Clear')}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            aria-label="Close cart"
                            className="w-10 h-10 bg-ink/5 rounded-full flex items-center justify-center hover:bg-ink/10 transition-colors focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
                        >
                            <X size={16} className="text-ink" />
                        </button>
                    </div>
                </div>

                {/* ── Free Shipping Progress ───────────────────── */}
                <div className="px-6 py-4 border-b border-ink/10 bg-ink/5">
                    {amountToFreeShipping > 0 ? (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-ink/60">
                                    <Truck size={11} />
                                    {tx('Plus que', 'Only')} <span className="text-ink font-black">{formatPrice(amountToFreeShipping)}</span> {tx('pour la livraison gratuite !', 'away from free shipping!')}
                                </div>
                                <span className="text-[9px] font-bold text-ink/50">{Math.round(freeShippingProgress)}%</span>
                            </div>
                            <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${freeShippingProgress}%` }}
                                    transition={{ duration: 0.6 }}
                                    className="h-full bg-gradient-to-r from-gold to-[#b8914d] rounded-full"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gold">
                            <Check size={14} />
                            <span className="text-[10px] font-black uppercase tracking-wider">{tx('Livraison gratuite offerte ! 🎉', 'Free shipping unlocked! 🎉')}</span>
                        </div>
                    )}
                </div>

                {/* ── Items ───────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    <AnimatePresence>
                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-64 text-center"
                            >
                                <ShoppingBag size={40} className="text-ink/15 mb-4" />
                                <p className="font-bold text-ink/50 text-sm">{tx('Votre panier est vide', 'Your cart is empty')}</p>
                                <button
                                    onClick={onClose}
                                    className="mt-4 text-gold text-sm font-bold underline"
                                >
                                    {tx('Continuer mes achats', 'Continue Shopping')}
                                </button>
                            </motion.div>
                        ) : (
                            items.map(item => {
                                const displayName = item.product.name;
                                const unitLabel = item.saleUnit.name;
                                const lineTotal = item.unitPrice * item.quantity;
                                return (
                                    <motion.div
                                        key={`${item.product.id}-${item.saleUnit.id}`}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="flex gap-4 bg-ink/5 rounded-2xl p-4 border border-ink/10"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 bg-sand rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-ink/10">
                                            {getProductImage(item.product) ? (
                                                <img src={getProductImage(item.product)!} alt={displayName} className="w-14 h-14 object-contain" />
                                            ) : (
                                                <div className="w-14 h-14 flex items-center justify-center text-ink/30 text-2xl">&#9749;</div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-ink leading-tight truncate">{displayName}</p>
                                            <p className="text-[10px] text-ink/50 font-bold mt-0.5">{unitLabel}</p>

                                            <div className="flex items-center justify-between mt-2">
                                                                        {/* Qty stepper */}
                                                <div className="flex items-center bg-sand border border-ink/10 rounded-full px-1 py-0.5 gap-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.saleUnit.id, item.quantity - 1)}
                                                        aria-label="Decrease quantity"
                                                        className="w-9 h-9 rounded-full flex items-center justify-center text-ink hover:bg-ink/5 transition-colors focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-1"
                                                    >
                                                        <Minus size={11} />
                                                    </button>
                                                    <span className="text-sm font-black w-6 text-center text-ink">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.saleUnit.id, item.quantity + 1)}
                                                        aria-label="Increase quantity"
                                                        className="w-9 h-9 rounded-full flex items-center justify-center text-ink hover:bg-ink/5 transition-colors focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-1"
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <span className="font-black text-gold text-base">{formatPrice(lineTotal)}</span>
                                            </div>
                                        </div>

                                                        {/* Remove */}
                                        <button
                                            onClick={() => removeFromCart(item.product.id, item.saleUnit.id)}
                                            aria-label={`Remove ${displayName} from cart`}
                                            className="w-9 h-9 flex items-center justify-center text-ink/40 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-1 rounded-full"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Footer ──────────────────────────────────── */}
                {items.length > 0 && (
                    <div className="border-t border-ink/10 px-6 py-5 space-y-4 bg-sand">
                        {/* Promo Code */}
                        <div>
                            <button
                                onClick={() => setPromoExpanded(p => !p)}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/50 hover:text-gold transition-colors"
                            >
                                <Tag size={11} />
                                {appliedPromo
                                    ? <span className="text-gold">{appliedPromo.code}{promoDiscount > 0 && ` (-${formatPrice(promoDiscount)})`}</span>
                                    : tx('Ajouter un code promo', 'Add Promo Code')
                                }
                            </button>

                            <AnimatePresence>
                                {promoExpanded && !appliedPromo && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex gap-2 mt-3">
                                            <label htmlFor="cart-promo-code" className="sr-only">{tx('Code promo', 'Promo code')}</label>
                                            <input
                                                id="cart-promo-code"
                                                type="text"
                                                value={promoInput}
                                                onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                                onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                                                placeholder={tx('Code promo', 'Promo code')}
                                                className="flex-1 border-2 border-ink/10 rounded-full px-4 py-2.5 text-sm font-bold text-ink placeholder-ink/30 focus:border-gold focus:outline-none transition-colors bg-ink/5"
                                            />
                                            <button
                                                onClick={handleApplyPromo}
                                                className="px-5 py-2.5 bg-gold text-ink rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-[#b8914d] transition-colors"
                                            >
                                                {tx('Appliquer', 'Apply')}
                                            </button>
                                        </div>
                                        {promoError && (
                                            <p className="text-red-400 text-[10px] font-bold mt-1.5 pl-2">{promoError}</p>
                                        )}
                                    </motion.div>
                                )}
                                {appliedPromo && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="flex justify-between items-center mt-2 overflow-hidden"
                                    >
                                        <span className="text-[10px] text-ink/50">{appliedPromo.promotion_name} ({appliedPromo.code})</span>
                                        <button onClick={removePromoCode} className="text-[9px] text-red-400 font-bold hover:underline">
                                            {tx('Supprimer', 'Remove')}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Order summary */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm text-ink/60">
                                <span>{tx('Sous-total', 'Subtotal')}</span>
                                <span className="font-bold">{formatPrice(subtotal)}</span>
                            </div>
                            {promoDiscount > 0 && (
                                <div className="flex justify-between text-sm text-gold">
                                    <span>{appliedPromo?.code}</span>
                                    <span className="font-bold">-{formatPrice(promoDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-ink/50">
                                <span>{tx('Livraison', 'Shipping')}</span>
                                <span className="italic text-[11px]">{tx('Calculée au paiement', 'Calculated at checkout')}</span>
                            </div>
                            <div className="flex justify-between text-base text-ink border-t border-ink/10 pt-2 mt-2">
                                <span className="font-black uppercase tracking-wider">{tx('Sous-total', 'Subtotal')}</span>
                                <span className="font-display text-2xl text-gold">{formatPrice(subtotal - promoDiscount)}</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className="flex justify-between items-center w-full bg-gold text-ink px-7 py-4 rounded-full shadow-lg shadow-gold/25 hover:bg-[#b8914d] transition-colors focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
                        >
                            <div className="min-w-0">
                                <p className="text-[8px] font-bold tracking-widest uppercase opacity-75">{tx('Sous-total', 'Subtotal')} · {cartCount} article(s)</p>
                                <p className="font-display text-xl leading-none truncate">{formatPrice(subtotal - promoDiscount)}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                                {tx('Commander', 'Checkout')} <ArrowRight size={16} />
                            </div>
                        </Link>
                    </div>
                )}
            </motion.aside>
        </>,
        document.body
    );
}
