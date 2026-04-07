"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, Truck, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { AppConfig } from '@/lib/config';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const {
        items, cartCount, subtotal, sitewideDiscount, promoDiscount,
        shippingCost, total, amountToFreeShipping,
        appliedPromo, promoError, applyPromoCode, removePromoCode,
        selectedShipping, setShipping,
        removeFromCart, updateQuantity, clearCart,
    } = useCart();
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;

    const [promoInput, setPromoInput] = useState('');
    const [promoExpanded, setPromoExpanded] = useState(false);

    const freeShippingThreshold = AppConfig.promo.freeShippingThreshold;
    const freeShippingProgress = Math.min(100, ((subtotal - promoDiscount - sitewideDiscount) / freeShippingThreshold) * 100);

    const handleApplyPromo = () => {
        if (promoInput.trim()) applyPromoCode(promoInput.trim());
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[30000]"
                    />
                )}
            </AnimatePresence>

            {/* Drawer */}
            <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: open ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-[30001] flex flex-col shadow-2xl"
            >
                {/* ── Header ──────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sb-green/10 rounded-full flex items-center justify-center">
                            <ShoppingBag size={18} className="text-sb-green" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-widest">{tx('Mon Panier', 'My Cart')}</p>
                            <p className="text-xs text-gray-400 font-bold">{cartCount} {tx('article(s)', 'item(s)')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {items.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-[9px] font-bold uppercase tracking-wider text-gray-300 hover:text-red-400 transition-colors"
                            >
                                {tx('Vider', 'Clear')}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            aria-label="Close cart"
                            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-sb-green focus-visible:outline-offset-2"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ── Free Shipping Progress ───────────────────── */}
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50">
                    {amountToFreeShipping > 0 ? (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                                    <Truck size={11} />
                                    {tx('Plus que', 'Only')} <span className="text-sb-black font-black">€{amountToFreeShipping.toFixed(2)}</span> {tx('pour la livraison gratuite !', 'away from free shipping!')}
                                </div>
                                <span className="text-[9px] font-bold text-gray-400">{Math.round(freeShippingProgress)}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${freeShippingProgress}%` }}
                                    transition={{ duration: 0.6 }}
                                    className="h-full bg-gradient-to-r from-sb-green to-[#2ecc71] rounded-full"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sb-green">
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
                                <ShoppingBag size={40} className="text-gray-100 mb-4" />
                                <p className="font-bold text-gray-400 text-sm">{tx('Votre panier est vide', 'Your cart is empty')}</p>
                                <button
                                    onClick={onClose}
                                    className="mt-4 text-sb-green text-sm font-bold underline"
                                >
                                    {tx('Continuer mes achats', 'Continue Shopping')}
                                </button>
                            </motion.div>
                        ) : (
                            items.map(item => {
                                const displayName = language === 'fr' ? item.product.name : (item.product.nameEn ?? item.product.name);
                                const unitLabel = language === 'fr' ? item.saleUnit.label : (item.saleUnit.labelEn ?? item.saleUnit.label);
                                const lineTotal = item.unitPrice * item.quantity;
                                return (
                                    <motion.div
                                        key={`${item.product.id}-${item.saleUnit.id}`}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="flex gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                                            <img src={item.product.image} alt={displayName} className="w-14 h-14 object-contain" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-sb-black leading-tight truncate">{displayName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">{unitLabel}</p>

                                            <div className="flex items-center justify-between mt-2">
                                                                        {/* Qty stepper */}
                                                <div className="flex items-center bg-white border border-gray-100 rounded-full px-1 py-0.5 gap-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.saleUnit.id, item.quantity - 1)}
                                                        aria-label="Decrease quantity"
                                                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-sb-green focus-visible:outline-offset-1"
                                                    >
                                                        <Minus size={11} />
                                                    </button>
                                                    <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.saleUnit.id, item.quantity + 1)}
                                                        aria-label="Increase quantity"
                                                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-sb-green focus-visible:outline-offset-1"
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <span className="font-black text-sb-green text-base">€{lineTotal.toFixed(2)}</span>
                                            </div>
                                        </div>

                                                        {/* Remove */}
                                        <button
                                            onClick={() => removeFromCart(item.product.id, item.saleUnit.id)}
                                            aria-label={`Remove ${displayName} from cart`}
                                            className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5 focus-visible:outline-2 focus-visible:outline-sb-green focus-visible:outline-offset-1 rounded-full"
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
                    <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-white">
                        {/* Promo Code */}
                        <div>
                            <button
                                onClick={() => setPromoExpanded(p => !p)}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-sb-green transition-colors"
                            >
                                <Tag size={11} />
                                {appliedPromo
                                    ? <span className="text-sb-green">{appliedPromo.code} (-€{promoDiscount.toFixed(2)})</span>
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
                                                className="flex-1 border-2 border-gray-100 rounded-full px-4 py-2.5 text-sm font-bold focus:border-sb-green focus:outline-none transition-colors bg-gray-50"
                                            />
                                            <button
                                                onClick={handleApplyPromo}
                                                className="px-5 py-2.5 bg-sb-green text-white rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-sb-dark transition-colors"
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
                                        <span className="text-[10px] text-gray-400">{appliedPromo.label}</span>
                                        <button onClick={removePromoCode} className="text-[9px] text-red-400 font-bold hover:underline">
                                            {tx('Supprimer', 'Remove')}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Shipping method selector */}
                        <div className="flex gap-2">
                            {[AppConfig.shipping.standard, AppConfig.shipping.express].map((method) => {
                                const isActive = selectedShipping.id === method.id;
                                const label = language === 'fr' ? method.label : method.labelEn;
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setShipping(method)}
                                        className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-[9px] font-bold uppercase tracking-wider transition-all ${isActive ? 'border-sb-green bg-sb-green/5 text-sb-green' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        <span>{label}</span>
                                        <span className={`block font-black text-base ${isActive ? 'text-sb-green' : 'text-sb-black'}`}>
                                            {method.price === 0 ? tx('Gratuit', 'Free') : `€${method.price.toFixed(2)}`}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Order summary */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{tx('Sous-total', 'Subtotal')}</span>
                                <span className="font-bold">€{subtotal.toFixed(2)}</span>
                            </div>
                            {sitewideDiscount > 0 && (
                                <div className="flex justify-between text-sm text-sb-green">
                                    <span>{tx('Remise boutique', 'Store discount')}</span>
                                    <span className="font-bold">-€{sitewideDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            {promoDiscount > 0 && (
                                <div className="flex justify-between text-sm text-sb-green">
                                    <span>{appliedPromo?.code}</span>
                                    <span className="font-bold">-€{promoDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{tx('Livraison', 'Shipping')}</span>
                                <span className={`font-bold ${shippingCost === 0 ? 'text-sb-green' : ''}`}>
                                    {shippingCost === 0 ? tx('Gratuite', 'Free') : `€${shippingCost.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-base text-sb-black border-t border-gray-100 pt-2 mt-2">
                                <span className="font-black uppercase tracking-wider">{tx('Total', 'Total')}</span>
                                <span className="font-display text-2xl text-sb-green">€{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className="flex justify-between items-center w-full bg-sb-green text-white px-7 py-4 rounded-full shadow-lg shadow-sb-green/25 hover:bg-sb-dark transition-colors focus-visible:outline-2 focus-visible:outline-sb-green focus-visible:outline-offset-2"
                        >
                            <div>
                                <p className="text-[8px] font-bold tracking-widest uppercase opacity-75">{tx('Total', 'Total')} · {cartCount} article(s)</p>
                                <p className="font-display text-xl leading-none">€{total.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                                {tx('Commander', 'Checkout')} <ArrowRight size={16} />
                            </div>
                        </Link>
                    </div>
                )}
            </motion.aside>
        </>
    );
}
