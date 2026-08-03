"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFormatPrice } from '@/context/SiteSettingsContext';
import { getProductImage, getDisplayPrice, getDefaultUnit } from '@/types';
import { CupSeparator } from '@/components/ui/CupSeparator';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { t } = useLanguage();
    const formatPrice = useFormatPrice();

    const handleAddToCart = (product: any) => {
        const unit = getDefaultUnit(product) ?? {
            id: 0,
            name: t('defaultUnit'),
            unit_type: 'pc',
            selling_price: product.selling_price,
            pricing_method: 'direct' as const,
            sku: '',
            stock: 1,
            quantity: 1,
            is_default: true,
            status: 'active' as const,
        };
        addToCart(product, unit, 1);
    };

    return (
        <div className="min-h-screen bg-ink text-sand pt-20 grain-overlay">
            {/* Hero */}
            <section className="bg-ink pt-12 sm:pt-16 pb-20 sm:pb-28 md:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,160,90,0.15),_transparent_60%)]" />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                            <Heart size={12} className="fill-gold" />
                            {t('wishlistPageTitle')}
                        </p>
                        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl uppercase text-sand leading-[0.85] mb-4">
                            {t('wishlistPageSubtitle')}
                        </h1>
                        <p className="text-sand/50 text-lg">
                            {wishlist.length === 0
                                ? t('noSavedProducts')
                                : t('savedProductCount').replace('{{count}}', String(wishlist.length))
                            }
                        </p>
                        <div className="max-w-xs mt-10">
                            <CupSeparator tone="gold" />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
                <AnimatePresence mode="popLayout">
                    {wishlist.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="w-24 h-24 bg-sand/10 rounded-full flex items-center justify-center mb-6">
                                <Heart size={36} className="text-cocoa/50" />
                            </div>
                            <h2 className="font-display text-4xl uppercase text-sand mb-3">
                                {t('emptyWishlistTitle')}
                            </h2>
                            <p className="text-cocoa mb-8 max-w-sm">
                                {t('emptyWishlistDesc')}
                            </p>
                            <Link
                                href="/shop"
                                className="flex items-center gap-3 px-8 py-4 bg-gold text-ink rounded-full font-black uppercase tracking-widest text-sm shadow-lg shadow-gold/25 hover:bg-[#b8914d] transition-colors"
                            >
                                {t('exploreShop')} <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
                            {wishlist.map((product, i) => {
                                const displayName = product.name;
                                const primaryImage = getProductImage(product);
                                const defaultUnit = getDefaultUnit(product);
                                return (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-sand rounded-[28px] border border-cocoa/15 shadow-[0_2px_16px_rgba(0,0,0,0.25)] overflow-hidden group hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all"
                                    >
                                        {/* Image */}
                                        <Link href={`/shop/${product.slug ?? product.id}`} className="block relative h-52 bg-[#E3D5BE] overflow-hidden">
                                            <img
                                                src={primaryImage ?? ''}
                                                alt={displayName}
                                                className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <button
                                                onClick={(e) => { e.preventDefault(); removeFromWishlist(product.id); }}
                                                className="absolute top-3 right-3 w-8 h-8 bg-sand rounded-full shadow flex items-center justify-center text-red-400 hover:text-red-600 hover:scale-110 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </Link>

                                        {/* Info */}
                                        <div className="p-5">
                                            <p className="font-black text-sm text-ink mb-0.5 truncate">{displayName}</p>
                                            {defaultUnit?.name && (
                                                <p className="text-[10px] text-ink/50 uppercase tracking-widest mb-3 truncate">{defaultUnit.name}</p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="font-black text-lg text-gold">{formatPrice(getDisplayPrice(product))}</span>
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-ink text-sand rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-ink transition-colors"
                                                >
                                                    <ShoppingBag size={12} />
                                                    {t('wishlistAdd')}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>

                {wishlist.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center mt-12"
                    >
                        <button
                            onClick={() => wishlist.forEach(p => removeFromWishlist(p.id))}
                            className="flex items-center gap-2 text-sm text-cocoa hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={14} />
                            {t('clearWishlist')}
                        </button>
                    </motion.div>
                )}
            </section>
        </div>
    );
}
