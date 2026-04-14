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

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { language } = useLanguage();
    const formatPrice = useFormatPrice();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;

    const handleAddToCart = (product: any) => {
        const unit = getDefaultUnit(product) ?? {
            id: 0,
            name: 'Unit',
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
        <div className="min-h-screen bg-[#FAF9F6] pt-20">
            {/* Hero */}
            <section className="bg-sb-black pt-12 sm:pt-16 pb-20 sm:pb-28 md:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(57,119,77,0.2),_transparent_60%)]" />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                            <Heart size={12} className="fill-sb-green" />
                            {tx('Mes Favoris', 'My Wishlist')}
                        </p>
                        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl uppercase text-white leading-[0.85] mb-4">
                            {tx('Liste de Souhaits', 'Wishlist')}
                        </h1>
                        <p className="text-white/40 text-lg">
                            {wishlist.length === 0
                                ? tx('Aucun produit sauvegardé.', 'No saved products yet.')
                                : tx(`${wishlist.length} produit${wishlist.length > 1 ? 's' : ''} sauvegardé${wishlist.length > 1 ? 's' : ''}`, `${wishlist.length} saved product${wishlist.length > 1 ? 's' : ''}`)
                            }
                        </p>
                    </motion.div>
                </div>
                <div className="torn-paper-white-down z-20" />
            </section>

            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
                <AnimatePresence mode="popLayout">
                    {wishlist.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <Heart size={36} className="text-gray-300" />
                            </div>
                            <h2 className="font-display text-4xl uppercase text-sb-black mb-3">
                                {tx('Votre liste est vide', 'Your wishlist is empty')}
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-sm">
                                {tx('Sauvegardez vos produits préférés en cliquant sur le cœur.', 'Save your favourite products by clicking the heart icon.')}
                            </p>
                            <Link
                                href="/shop"
                                className="flex items-center gap-3 px-8 py-4 bg-sb-green text-white rounded-full font-black uppercase tracking-widest text-sm shadow-lg shadow-sb-green/25 hover:bg-[#2C6345] transition-colors"
                            >
                                {tx('Explorer la boutique', 'Explore the Shop')} <ArrowRight size={16} />
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
                                        className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all"
                                    >
                                        {/* Image */}
                                        <Link href={`/shop/${product.slug ?? product.id}`} className="block relative h-52 bg-gray-50 overflow-hidden">
                                            <img
                                                src={primaryImage ?? ''}
                                                alt={displayName}
                                                className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <button
                                                onClick={(e) => { e.preventDefault(); removeFromWishlist(product.id); }}
                                                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-400 hover:text-red-600 hover:scale-110 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </Link>

                                        {/* Info */}
                                        <div className="p-5">
                                            <p className="font-black text-sm text-sb-black mb-0.5 truncate">{displayName}</p>
                                            {defaultUnit?.name && (
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3 truncate">{defaultUnit.name}</p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="font-black text-lg text-sb-green">{formatPrice(getDisplayPrice(product))}</span>
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-sb-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-sb-green transition-colors"
                                                >
                                                    <ShoppingBag size={12} />
                                                    {tx('Ajouter', 'Add')}
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
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={14} />
                            {tx('Vider la liste', 'Clear wishlist')}
                        </button>
                    </motion.div>
                )}
            </section>
        </div>
    );
}
