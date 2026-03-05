"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Tag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/store/CartContext';
import { IntensityBar } from './IntensityBar';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    index: number;
}

export function ProductCard({ product, onClick, index }: ProductCardProps) {
    const { addToCart } = useCart();
    const { language, t } = useLanguage();
    const [isAdded, setIsAdded] = useState(false);
    const [imgIdx, setImgIdx] = useState(0);

    // inStock defaults to true when undefined (backward-compatible)
    const isInStock = product.inStock !== false;

    const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
    const displayNamePart2 = language === 'en' && product.namePart2En ? product.namePart2En : product.namePart2;

    // Image gallery support: use images array if available, else fall back to single image
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const currentImage = images[imgIdx] ?? product.image;

    // Pricing
    const baseUnit = product.saleUnits?.[0];
    const displayPrice = baseUnit?.price ?? product.price;
    const originalPrice = baseUnit?.originalPrice ?? product.originalPrice;
    const hasDiscount = !!originalPrice && originalPrice > displayPrice;
    const discountPct = hasDiscount ? Math.round((1 - displayPrice / originalPrice!) * 100) : 0;

    // First 2 aromatic notes (if any)
    const visibleNotes = product.notes?.slice(0, 2) ?? [];

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isInStock) return;
        const defaultUnit = product.saleUnits?.[0] ?? {
            id: 'default',
            label: product.namePart2 ?? 'Unité',
            price: product.price,
            quantity: 1,
        };
        addToCart(product, defaultUnit, 1);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1600);
    };

    const pdpHref = `/shop/${product.slug ?? product.id}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: index * 0.12 }}
            onClick={() => onClick(product)}
            className="bg-white rounded-[40px] p-4 border border-gray-200 shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)] transition-all duration-500 relative group cursor-pointer z-10 hover:z-20 flex flex-col w-full max-w-lg mx-auto"
        >
            {/* ── Image Zone ─────────────────────────────────── */}
            <div
                className="bg-[#60A17B] rounded-[32px] border border-white/30 relative flex items-center justify-center overflow-hidden transition-colors duration-500 group-hover:bg-sb-green shrink-0"
                style={{ aspectRatio: '1/1' }}
                onMouseMove={(e) => {
                    if (images.length > 1) {
                        const pct = e.nativeEvent.offsetX / e.currentTarget.clientWidth;
                        setImgIdx(Math.floor(pct * images.length));
                    }
                }}
                onMouseLeave={() => setImgIdx(0)}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent mix-blend-overlay pointer-events-none" />
                {hasDiscount && (
                    <div className="absolute top-4 left-4 z-20 bg-red-500 text-white text-[9px] font-black rounded-full px-2.5 py-1 shadow-lg">-{discountPct}%</div>
                )}
                {product.isNew && !hasDiscount && (
                    <div className="absolute top-4 left-4 z-20 bg-sb-black text-white text-[9px] font-black rounded-full px-2.5 py-1">NEW</div>
                )}
                {product.tags?.includes('best-seller') && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-amber-400/90 backdrop-blur-sm text-white text-[8px] font-black rounded-full px-2 py-1">
                        <Star size={8} fill="white" /> #1
                    </div>
                )}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                        {images.map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/40'}`} />
                        ))}
                    </div>
                )}

                {/* Stock badge */}
                <div className={`absolute top-4 right-14 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-sm shadow-sm ${isInStock
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? 'bg-white' : 'bg-white/80'} animate-pulse`} />
                    {isInStock ? t('inStock') || 'In Stock' : t('outOfStock') || 'Out of Stock'}
                </div>
                <motion.button
                    className={`w-10 h-10 shadow-xl border border-white/20 rounded-full flex items-center justify-center absolute bottom-4 right-4 z-20 transition-all duration-300 transform ${isInStock
                            ? 'bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer'
                            : 'bg-black/20 backdrop-blur-md opacity-60 cursor-not-allowed'
                        }`}
                    whileHover={isInStock ? { scale: 1.12, backgroundColor: 'rgba(255,255,255,0.4)' } : {}}
                    whileTap={isInStock ? { scale: 0.92 } : {}}
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                >
                    <AnimatePresence mode="wait">
                        {isAdded ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-white text-sm font-black">✓</motion.span> : <motion.div key="bag" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><ShoppingBag className="w-4 h-4 text-white" /></motion.div>}
                    </AnimatePresence>
                </motion.button>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImage}
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
                        src={currentImage} alt={displayName} className="h-full w-full object-cover rounded-[inherit] drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)] z-10 group-hover:scale-105 transition-transform duration-700"
                    />
                </AnimatePresence>
            </div>

            {/* ── Content ───────────────────────────────────── */}
            <div className="px-3 pt-5 pb-2 flex flex-col flex-1 gap-2">
                <h3 className="font-display text-[1.35rem] uppercase leading-tight group-hover:text-sb-green transition-colors line-clamp-2">
                    {displayName}
                    {displayNamePart2 && <span className="text-gray-300"> {displayNamePart2}</span>}
                </h3>
                {visibleNotes.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                        {visibleNotes.map(note => (
                            <span key={note} className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider bg-sb-green/10 text-sb-green px-2 py-1 rounded-full border border-sb-green/20"><Tag size={8} />{note}</span>
                        ))}
                    </div>
                )}
                {product.intensity != null && product.intensity > 0 ? (
                    <IntensityBar intensity={product.intensity} />
                ) : <div className="h-1" />}
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-sb-green tracking-tighter">€{displayPrice.toFixed(2)}</span>
                    {hasDiscount && <span className="text-sm text-gray-300 line-through">€{originalPrice!.toFixed(2)}</span>}
                </div>
            </div>
        </motion.div>
    );
}
