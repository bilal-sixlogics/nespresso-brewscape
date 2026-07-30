"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import {
    Product,
    getProductImage, getProductImages, getDefaultUnit, getDisplayPrice,
    isInStock, isNewProduct, hasTag, extractNotes, extractIntensity,
} from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useFormatPrice } from '@/context/SiteSettingsContext';
import { IntensityBar } from '@/components/ui/IntensityBar';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    index: number;
}

export function ProductCard({ product, onClick, index }: ProductCardProps) {
    const { t } = useLanguage();
    const formatPrice = useFormatPrice();
    const [imgIdx, setImgIdx] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const inStock = isInStock(product);
    const productIsNew = isNewProduct(product);
    const isBestSeller = hasTag(product, 'best-seller');

    const defaultUnit = getDefaultUnit(product);
    const allImages = getProductImages(product);
    const primaryImage = getProductImage(product);
    const images = allImages.length > 0 ? allImages : primaryImage ? [primaryImage] : [];
    const currentImage = images[imgIdx] ?? primaryImage;

    const displayPrice = getDisplayPrice(product);
    const discountVal = Number(defaultUnit?.discount_value) || 0;
    const originalPrice = defaultUnit && defaultUnit.pricing_method !== 'direct' && discountVal > 0
        ? (defaultUnit.pricing_method === 'percentage_off'
            ? displayPrice / (1 - discountVal / 100)
            : displayPrice + discountVal)
        : null;
    const hasDiscount = !!originalPrice && originalPrice > displayPrice;
    const discountPct = hasDiscount ? Math.round((1 - displayPrice / originalPrice!) * 100) : 0;

    const notes = extractNotes(product.sections);
    const intensity = extractIntensity(product.sections);

    return (
        <motion.article
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.07, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onClick(product)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative cursor-pointer flex flex-col w-full h-full"
            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            role="button"
            tabIndex={0}
            aria-label={`View ${product.name}`}
            onKeyDown={(e) => e.key === 'Enter' && onClick(product)}
        >
            {/* ── Card Shell — beige, sitting on the black page background ── */}
            <div className="relative flex flex-col h-full bg-sand rounded-[28px] overflow-hidden border border-cocoa/15 shadow-[0_2px_16px_rgba(0,0,0,0.25)] transition-shadow duration-500 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>

                {/* ── Image Zone ── */}
                <div
                    className="relative overflow-hidden bg-[#E3D5BE] shrink-0"
                    style={{ aspectRatio: '4/3' }}
                    onMouseMove={(e) => {
                        if (images.length > 1) {
                            const pct = e.nativeEvent.offsetX / e.currentTarget.clientWidth;
                            setImgIdx(Math.floor(pct * images.length));
                        }
                    }}
                    onMouseLeave={() => setImgIdx(0)}
                >
                    <AnimatePresence mode="wait">
                        {currentImage ? (
                            <motion.img
                                key={currentImage}
                                initial={{ opacity: 0, scale: 1.04 }}
                                animate={{ opacity: 1, scale: isHovered ? 1.06 : 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                src={currentImage}
                                alt={product.name}
                                className="absolute inset-0 w-full h-full object-cover"
                                draggable={false}
                            />
                        ) : (
                            /* Premium no-image placeholder */
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-sand to-[#ddc9a8]">
                                <div className="w-16 h-16 rounded-full bg-white/40 flex items-center justify-center shadow-inner">
                                    <svg viewBox="0 0 40 40" className="w-8 h-8 text-cocoa" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M8 28 Q10 20 20 18 Q30 16 32 10" strokeLinecap="round"/>
                                        <ellipse cx="20" cy="30" rx="12" ry="4" opacity="0.3" fill="currentColor" stroke="none"/>
                                        <path d="M14 28 Q16 22 20 20 Q24 18 26 14" strokeLinecap="round" opacity="0.5"/>
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-cocoa">{product.brand?.name ?? 'Cafrezzo'}</span>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Bottom gradient for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/40 to-transparent pointer-events-none" />

                    {/* ── Top Badges ── */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none z-10">
                        {/* Left: discount or new */}
                        <div>
                            {hasDiscount ? (
                                <span className="inline-block bg-red-500 text-white text-[10px] font-black tracking-wider rounded-full px-2.5 py-1 shadow">
                                    −{discountPct}%
                                </span>
                            ) : productIsNew ? (
                                <span className="inline-block bg-gold text-ink text-[10px] font-black tracking-[0.15em] rounded-full px-2.5 py-1">
                                    NEW
                                </span>
                            ) : null}
                        </div>

                        {/* Right: best seller */}
                        {isBestSeller && (
                            <span className="inline-flex items-center gap-1 bg-gold text-ink text-[10px] font-black tracking-wide rounded-full px-2 py-1 shadow">
                                <Star size={8} fill="currentColor" /> BEST
                            </span>
                        )}
                    </div>

                    {/* ── Stock indicator ── */}
                    <div className="absolute bottom-3 left-3 z-10">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide rounded-full px-2.5 py-1 backdrop-blur-sm shadow-sm ${inStock ? 'bg-emerald-600/90 text-white' : 'bg-red-600/85 text-white'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-white ${inStock ? 'animate-pulse' : ''}`} />
                            {inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    {/* ── Image dots ── */}
                    {images.length > 1 && (
                        <div className="absolute bottom-3 right-3 flex gap-1 z-10">
                            {images.map((_, i) => (
                                <div key={i} className={`rounded-full transition-all duration-200 ${i === imgIdx ? 'bg-white w-3.5 h-1.5' : 'bg-white/50 w-1.5 h-1.5'}`} />
                            ))}
                        </div>
                    )}

                    {/* ── Hover CTA overlay ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 6 }}
                            animate={{ scale: isHovered ? 1 : 0.9, y: isHovered ? 0 : 6 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-sand/95 backdrop-blur-md text-ink text-[11px] font-black tracking-[0.15em] uppercase px-5 py-2.5 rounded-full shadow-lg pointer-events-auto min-h-[44px] flex items-center"
                            onClick={(e) => { e.stopPropagation(); onClick(product); }}
                        >
                            View Details
                        </motion.div>
                    </motion.div>
                </div>

                {/* ── Content Area ── */}
                <div className="flex flex-col flex-1 px-4 pt-4 pb-4 gap-3">

                    {/* Brand + Name */}
                    <div>
                        {product.brand?.name && (
                            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-cocoa mb-1">
                                {product.brand.name}
                            </p>
                        )}
                        <h3 className="font-display text-[0.95rem] sm:text-base font-bold leading-snug text-ink group-hover:text-gold transition-colors duration-300 line-clamp-2">
                            {product.name}
                        </h3>
                        {product.tagline && (
                            <p className="text-[11px] text-cocoa/80 mt-0.5 line-clamp-1 font-medium">
                                {product.tagline}
                            </p>
                        )}
                    </div>

                    {/* Aromatic notes */}
                    {notes && notes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {notes.slice(0, 3).map(note => (
                                <span key={note} className="text-[10px] font-semibold text-cocoa bg-cocoa/8 border border-cocoa/20 px-2 py-0.5 rounded-full">
                                    {note}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Intensity — shared bean legend, replaces the old numeric bar */}
                    {intensity && intensity.value > 0 && (
                        <IntensityBar intensity={intensity.value} size="card" showLabel={false} tone="gold" />
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Price row + CTA */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-cocoa/15">
                        <div className="flex items-baseline gap-1.5">
                            <span className="font-display text-[1.15rem] sm:text-[1.25rem] font-bold text-gold tracking-tight">
                                {formatPrice(displayPrice)}
                            </span>
                            {hasDiscount && originalPrice && (
                                <span className="text-xs text-cocoa/60 line-through">
                                    {formatPrice(originalPrice)}
                                </span>
                            )}
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); onClick(product); }}
                            aria-label={`Quick look at ${product.name}`}
                            className="min-h-[38px] min-w-[38px] flex items-center justify-center bg-gold text-ink rounded-full hover:bg-[#b8914d] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 px-4 text-[11px] font-black tracking-wide"
                        >
                            <span className="hidden sm:inline">Select</span>
                            <span className="sm:hidden">→</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
