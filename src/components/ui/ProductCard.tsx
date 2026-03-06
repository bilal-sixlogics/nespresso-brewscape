"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Tag, Eye } from 'lucide-react';
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
    const [isHovered, setIsHovered] = useState(false);

    const isInStock = product.inStock !== false;

    const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name;
    const displayNamePart2 = language === 'en' && product.namePart2En ? product.namePart2En : product.namePart2;

    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const currentImage = images[imgIdx] ?? product.image;

    const baseUnit = product.saleUnits?.[0];
    const displayPrice = baseUnit?.price ?? product.price;
    const originalPrice = baseUnit?.originalPrice ?? product.originalPrice;
    const hasDiscount = !!originalPrice && originalPrice > displayPrice;
    const discountPct = hasDiscount ? Math.round((1 - displayPrice / originalPrice!) * 100) : 0;

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
            transition={{ duration: 0.55, delay: Math.min(index, 4) * 0.08 }}
            onClick={() => onClick(product)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="bg-white rounded-2xl sm:rounded-[40px] p-2.5 sm:p-4 border border-gray-200 shadow-sm hover:shadow-[0_24px_64px_rgba(0,0,0,0.12)] transition-all duration-500 relative group cursor-pointer z-10 hover:z-20 flex flex-col w-full h-full max-w-lg mx-auto"
        >
            {/* ── Image Zone ─────────────────────────────────── */}
            <div
                className="relative rounded-xl sm:rounded-[32px] overflow-hidden shrink-0"
                style={{ aspectRatio: '1/1', background: 'linear-gradient(145deg, #f5f0eb 0%, #ede8e0 100%)' }}
                onMouseMove={(e) => {
                    if (images.length > 1) {
                        const pct = e.nativeEvent.offsetX / e.currentTarget.clientWidth;
                        setImgIdx(Math.floor(pct * images.length));
                    }
                }}
                onMouseLeave={() => setImgIdx(0)}
            >
                {/* Image — scales up smoothly on hover */}
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImage}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: isHovered ? 1.08 : 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        src={currentImage}
                        alt={displayName}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </AnimatePresence>

                {/* Hover overlay — dark vignette fades in, revealing the action buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"
                />

                {/* Badges */}
                {hasDiscount && (
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 bg-red-500 text-white text-[8px] sm:text-[9px] font-black rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-lg">-{discountPct}%</div>
                )}
                {product.isNew && !hasDiscount && (
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 bg-sb-black text-white text-[8px] sm:text-[9px] font-black rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1">NEW</div>
                )}
                {product.tags?.includes('best-seller') && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex items-center gap-1 bg-amber-400/90 backdrop-blur-sm text-white text-[7px] sm:text-[8px] font-black rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1">
                        <Star size={8} fill="white" className="w-[6px] h-[6px] sm:w-2 sm:h-2" /> #1
                    </div>
                )}

                {/* Stock pill */}
                <div className={`absolute top-2 sm:top-4 ${product.tags?.includes('best-seller') ? 'right-12 sm:right-16' : 'right-2 sm:right-4'} z-20 flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-wider backdrop-blur-sm shadow-sm ${isInStock ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                    <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isInStock ? 'bg-white' : 'bg-white/80'} animate-pulse`} />
                    {isInStock ? t('inStock') || 'In Stock' : t('outOfStock') || 'Out of Stock'}
                </div>

                {/* Image dots (multi-image indicator) */}
                {images.length > 1 && (
                    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                        {images.map((_, i) => (
                            <div key={i} className={`rounded-full transition-all duration-200 ${i === imgIdx ? 'bg-white w-4 h-1.5' : 'bg-white/40 w-1.5 h-1.5'}`} />
                        ))}
                    </div>
                )}

                {/* Hover CTA — slides up from the bottom */}
                <motion.div
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: isHovered ? 0 : 16, opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex gap-1.5 sm:gap-2"
                >
                    {/* Add to Cart */}
                    <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={handleAddToCart}
                        disabled={!isInStock}
                        className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2.5 rounded-full text-[8px] sm:text-[11px] font-black uppercase tracking-widest shadow-xl transition-colors duration-200 ${isInStock
                            ? 'bg-sb-green text-white hover:bg-[#2C6345]'
                            : 'bg-white/20 text-white/60 cursor-not-allowed backdrop-blur-sm'
                            }`}
                    >
                        <AnimatePresence mode="wait">
                            {isAdded
                                ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-white font-black">✓ Added</motion.span>
                                : <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1 sm:gap-1.5"><ShoppingBag size={12} className="w-3 h-3 sm:w-[13px] sm:h-[13px]" /> <span className="hidden sm:inline">{isInStock ? 'Add to Cart' : 'Sold Out'}</span><span className="inline sm:hidden">{isInStock ? 'Add' : 'Out'}</span></motion.span>
                            }
                        </AnimatePresence>
                    </motion.button>

                    {/* Quick Look */}
                    <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={(e) => { e.stopPropagation(); onClick(product); }}
                        className="w-7 h-7 sm:w-10 sm:h-10 shrink-0 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                    >
                        <Eye size={12} className="text-white w-3 h-3 sm:w-[15px] sm:h-[15px]" />
                    </motion.button>
                </motion.div>
            </div>

            {/* ── Content ───────────────────────────────────── */}
            <div className="px-1.5 sm:px-3 pt-3 sm:pt-5 pb-1 sm:pb-2 flex flex-col flex-1 gap-1.5 sm:gap-2">
                <h3 className="font-display text-xs sm:text-base md:text-[1.35rem] uppercase leading-tight group-hover:text-sb-green transition-colors duration-300 line-clamp-2">
                    {displayName}
                    {displayNamePart2 && <span className="text-gray-300"> {displayNamePart2}</span>}
                </h3>
                {visibleNotes.length > 0 && (
                    <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                        {visibleNotes.map(note => (
                            <span key={note} className="inline-flex items-center gap-0.5 sm:gap-1 text-[7px] sm:text-[8px] font-bold uppercase tracking-wider bg-sb-green/10 text-sb-green px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border border-sb-green/20"><Tag size={8} className="w-[6px] h-[6px] sm:w-2 sm:h-2" />{note}</span>
                        ))}
                    </div>
                )}
                {product.intensity != null && product.intensity > 0 ? (
                    <IntensityBar intensity={product.intensity} />
                ) : <div className="h-0.5 sm:h-1" />}
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto pt-1 sm:pt-2">
                    <span className="text-sm sm:text-xl md:text-2xl font-bold text-sb-green tracking-tighter">€{displayPrice.toFixed(2)}</span>
                    {hasDiscount && <span className="text-[10px] sm:text-sm text-gray-300 line-through">€{originalPrice!.toFixed(2)}</span>}
                </div>
            </div>
        </motion.div>
    );
}
