"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Tag } from 'lucide-react';
import { IntensityBar } from './IntensityBar';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    index: number;
}

export function ProductCard({ product, onClick, index }: ProductCardProps) {
    const { language, t } = useLanguage();
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: Math.min(index, 4) * 0.08 }}
            onClick={() => onClick(product)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            style={{ aspectRatio: '2/3' }}
            className="bg-white rounded-2xl sm:rounded-[32px] p-2 sm:p-3 border border-gray-200 shadow-sm hover:shadow-[0_24px_64px_rgba(0,0,0,0.12)] transition-all duration-500 relative group cursor-pointer z-10 hover:z-20 flex flex-col w-full overflow-hidden self-start"
        >
            {/* ── Image Zone ─────────────────────────────────── */}
            <div
                className="relative rounded-xl sm:rounded-2xl overflow-hidden shrink-0"
                style={{ aspectRatio: '1/1', background: 'linear-gradient(145deg, #f5f0eb 0%, #ede8e0 100%)' }}
                onMouseMove={(e) => {
                    if (images.length > 1) {
                        const pct = e.nativeEvent.offsetX / e.currentTarget.clientWidth;
                        setImgIdx(Math.floor(pct * images.length));
                    }
                }}
                onMouseLeave={() => setImgIdx(0)}
            >
                {/* Image */}
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

                {/* Hover overlay vignette */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"
                />

                {/* Discount badge */}
                {hasDiscount && (
                    <div className="absolute top-2 left-2 z-20 bg-red-500 text-white text-[8px] font-black rounded-full px-2 py-0.5 shadow-lg">
                        -{discountPct}%
                    </div>
                )}
                {product.isNew && !hasDiscount && (
                    <div className="absolute top-2 left-2 z-20 bg-sb-black text-white text-[8px] font-black rounded-full px-2 py-0.5">
                        NEW
                    </div>
                )}

                {/* Stock pill */}
                <div className={`absolute top-2 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider backdrop-blur-sm shadow-sm ${isInStock ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                    <span className={`w-1 h-1 rounded-full ${isInStock ? 'bg-white' : 'bg-white/80'} animate-pulse`} />
                    {isInStock ? t('inStock') || 'In Stock' : t('outOfStock') || 'Out'}
                </div>

                {/* Image dots for multi-image */}
                {images.length > 1 && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                        {images.map((_, i) => (
                            <div key={i} className={`rounded-full transition-all duration-200 ${i === imgIdx ? 'bg-white w-4 h-1.5' : 'bg-white/40 w-1.5 h-1.5'}`} />
                        ))}
                    </div>
                )}

                {/* Quick View CTA */}
                <motion.div
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: isHovered ? 0 : 12, opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute bottom-2 left-2 right-2 z-20"
                >
                    <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={(e) => { e.stopPropagation(); onClick(product); }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-white/90 backdrop-blur-md text-sb-black text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-white hover:text-sb-green transition-colors"
                    >
                        <Eye size={11} /> Quick View
                    </motion.button>
                </motion.div>
            </div>

            {/* ── Content ───────────────────────────────────── */}
            <div className="px-1.5 sm:px-2 pt-2.5 sm:pt-3 pb-1 flex flex-col flex-1 overflow-hidden gap-1 sm:gap-1.5">
                {/* Title */}
                <h3 className="font-display text-xs sm:text-sm uppercase leading-tight group-hover:text-sb-green transition-colors duration-300 line-clamp-1 sm:line-clamp-2 min-h-[1.4em]">
                    {displayName}
                    {displayNamePart2 && <span className="text-gray-300"> {displayNamePart2}</span>}
                </h3>

                {/* Notes tags — fixed height row */}
                <div className="flex gap-1 flex-wrap min-h-[18px] overflow-hidden">
                    {visibleNotes.map(note => (
                        <span key={note} className="inline-flex items-center gap-0.5 text-[7px] font-bold uppercase tracking-wider bg-sb-green/10 text-sb-green px-1.5 py-0.5 rounded-full border border-sb-green/20 whitespace-nowrap">
                            <Tag size={6} />{note}
                        </span>
                    ))}
                </div>

                {/* Intensity */}
                {product.intensity != null && product.intensity > 0
                    ? <IntensityBar intensity={product.intensity} />
                    : <div className="h-2" />
                }

                {/* Price — always at bottom */}
                <div className="flex items-baseline gap-1.5 mt-auto pt-1">
                    <span className="text-base sm:text-lg font-bold text-sb-green tracking-tighter">
                        €{displayPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                        <span className="text-[10px] text-gray-300 line-through">
                            €{originalPrice!.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
