"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown, ArrowRight, Star, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import {
    Product, SaleUnit,
    getProductImage, getProductImages, getDefaultUnit, getDisplayPrice,
    isInStock, isNewProduct, hasTag, extractNotes,
} from '@/types';
import { IntensityBar } from '@/components/ui/IntensityBar';
import { RichText } from '@/components/ui/RichText';

// ─── Panel Image Carousel ─────────────────────────────────────────────────────
function PanelImageCarousel({ product }: { product: Product }) {
    const allImages = getProductImages(product);
    const primaryImage = getProductImage(product);
    const images = allImages.length > 0 ? allImages : primaryImage ? [primaryImage] : [];
    const [imgIdx, setImgIdx] = React.useState(0);

    React.useEffect(() => {
        if (images.length <= 1) return;
        const t = setInterval(() => setImgIdx(p => (p + 1) % images.length), 3500);
        return () => clearInterval(t);
    }, [images.length]);

    return (
        <div className="relative h-56 sm:h-64 md:h-72 bg-[#60A17B] flex items-center justify-center overflow-hidden mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-[24px] sm:rounded-[32px] shadow-sm border border-white/30 group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <AnimatePresence mode="wait">
                {images.length > 0 ? (
                    <motion.img
                        key={imgIdx}
                        src={images[imgIdx]}
                        alt={product.name}
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full w-full object-cover rounded-[inherit] drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] relative z-10"
                    />
                ) : (
                    <div className="text-white/40 text-6xl">☕</div>
                )}
            </AnimatePresence>
            {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                            className={`rounded-full transition-all duration-300 ${i === imgIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Accordion ─────────────────────────────────────────────────────────────
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setOpen(p => !p)}
                className="w-full flex justify-between items-center py-4 text-left hover:text-sb-green transition-colors"
            >
                <span className="text-xs font-bold uppercase tracking-widest text-sb-black">{title}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="text-gray-400" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 text-sm text-gray-500 leading-relaxed">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
interface ProductDetailPanelProps {
    product: Product | null;
    onClose: () => void;
}

export function ProductDetailPanel({ product, onClose }: ProductDetailPanelProps) {
    const { addToCart } = useCart();
    const { t } = useLanguage();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<SaleUnit | null>(null);

    // Reset state when product changes
    React.useEffect(() => {
        setQuantity(1);
        setIsAdded(false);
        setIsRedirecting(false);
        setSelectedUnit(null);
    }, [product?.id]);

    if (!product) return null;

    const inStock = isInStock(product);
    const productIsNew = isNewProduct(product);
    const isBestSeller = hasTag(product, 'best-seller');

    // Determine the effective sale unit
    const defaultUnit = getDefaultUnit(product);
    const effectiveUnit: SaleUnit = selectedUnit ?? defaultUnit ?? {
        id: 0,
        name: 'Unit',
        unit_type: 'pc',
        quantity: 1,
        selling_price: product.selling_price,
        pricing_method: 'direct',
        sku: '',
        stock: product.stock_qty,
        is_default: true,
        status: 'active',
    };

    const unitPrice = Number(effectiveUnit.selling_price) || 0;

    const displayName = product.name;
    const displayPart2 = defaultUnit?.name;
    const displayTagline = product.tagline;
    const displayDesc = product.description;

    const notes = extractNotes(product.sections);

    const handleAddToCart = () => {
        addToCart(product, effectiveUnit, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1800);
    };

    return (
        <AnimatePresence>
            {product && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={displayName}
                        className="fixed top-0 right-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-[#FAF9F6] z-[110] shadow-2xl overflow-y-auto overflow-x-hidden border-l border-white/20 flex flex-col"
                    >
                        {/* ── Sticky Header ──────────────────────────── */}
                        <div className="sticky top-0 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-gray-100 z-20 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
                            <button
                                onClick={onClose}
                                aria-label="Close product panel"
                                className="flex items-center gap-2 text-sb-black opacity-60 hover:opacity-100 transition-opacity group focus-visible:outline-2 focus-visible:outline-sb-green focus-visible:outline-offset-2 rounded-full"
                            >
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border border-gray-50">
                                    <ArrowLeft size={14} />
                                </div>
                                <span className="text-[10px] font-bold tracking-widest uppercase">{t('keepExploring')}</span>
                            </button>

                            {/* Tags + Stock */}
                            <div className="flex gap-1.5 flex-wrap">
                                {productIsNew && (
                                    <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 bg-sb-black text-white rounded-full">{t('new')}</span>
                                )}
                                {isBestSeller && (
                                    <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 bg-amber-400 text-white rounded-full">{t('bestSeller')}</span>
                                )}
                                <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${inStock ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-200'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                                    {inStock ? (t('inStock') || 'In Stock') : (t('outOfStock') || 'Out of Stock')}
                                </span>
                            </div>
                        </div>

                        {/* ── Scrollable Content ──────────────────────── */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {/* Hero Image - multi-image carousel */}
                            <PanelImageCarousel product={product} />

                            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
                                {/* ── Title & Price ── */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <h2 className="font-display text-2xl sm:text-3xl uppercase leading-[0.9] text-sb-black">
                                            {displayName}
                                            {displayPart2 && (
                                                <span className="text-gray-300 block text-xl mt-1">{displayPart2}</span>
                                            )}
                                        </h2>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-display text-3xl sm:text-4xl text-sb-green leading-none">€{unitPrice.toFixed(2)}</div>
                                    </div>
                                </div>

                                {displayTagline && (
                                    <p className="text-xs text-gray-400 italic !mt-1">{displayTagline}</p>
                                )}

                                {/* ── Compact Sale Units ── */}
                                {product.sales_units && product.sales_units.length > 1 && (
                                    <div className="pt-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('selectPack')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {product.sales_units.map(unit => {
                                                const isActive = effectiveUnit.id === unit.id;
                                                return (
                                                    <button
                                                        key={unit.id}
                                                        onClick={() => setSelectedUnit(unit)}
                                                        className={`px-4 py-2 rounded-xl border-2 transition-all flex flex-col ${isActive
                                                            ? 'border-sb-green bg-sb-green/5 text-sb-green'
                                                            : 'border-gray-50 bg-white text-sb-black hover:border-sb-green/30'
                                                            }`}
                                                    >
                                                        <span className="text-[9px] font-bold uppercase">{unit.name}</span>
                                                        <span className="text-[10px] font-black opacity-80">€{Number(unit.selling_price).toFixed(2)}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ── Quick Specs ── */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {product.intensity != null && product.intensity > 0 && (
                                        <div className="bg-white p-3 rounded-2xl border border-gray-100">
                                            <IntensityBar intensity={product.intensity} size="panel" />
                                        </div>
                                    )}
                                </div>

                                {/* ── Aromatic Profile ── */}
                                {notes && notes.length > 0 && (
                                    <div className="bg-sb-green p-4 rounded-[20px] text-white">
                                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-2">{t('aromaticProfile')}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {notes.map(note => (
                                                <span key={note} className="bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                                    {note}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── View Full Details (Highly Visible CTA) ── */}
                                {product.slug && (
                                    <button
                                        disabled={isRedirecting}
                                        onClick={() => {
                                            setIsRedirecting(true);
                                            router.push(`/shop/${product.slug}`);
                                        }}
                                        className={`w-full group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-[20px] transition-all text-left ${isRedirecting ? 'opacity-70 cursor-not-allowed' : 'hover:border-sb-green hover:shadow-lg hover:shadow-sb-green/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isRedirecting
                                                ? 'bg-sb-green text-white'
                                                : 'bg-sb-green/5 border border-sb-green/10 text-sb-green group-hover:bg-sb-green group-hover:text-white'
                                                }`}>
                                                {isRedirecting ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <ArrowRight size={16} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sb-green mb-0.5">
                                                    {isRedirecting ? t('loading') : t('fullExperience')}
                                                </p>
                                                <p className="text-xs font-bold text-sb-black opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {isRedirecting ? 'Optimisation en cours...' : t('fullExperienceDesc')}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                )}

                                {/* ── Accordions (Description) ── */}
                                {displayDesc && (
                                    <div className="pt-2">
                                        <Accordion title={t('productDescription')}>
                                            <RichText content={displayDesc} size="panel" />
                                        </Accordion>
                                    </div>
                                )}

                                {/* Bottom padding */}
                                <div className="h-2" />
                            </div>
                        </div>

                        {/* ── Sticky Footer: Add to Cart ──────────────── */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 z-20 flex gap-2 sm:gap-3 items-center flex-shrink-0">

                            {/* Quantity */}
                            <div className="flex items-center border-2 border-gray-100 rounded-full p-1.5 bg-gray-50 flex-shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:text-sb-black transition-colors"
                                    aria-label="Decrease"
                                >
                                    <span className="w-3 h-0.5 bg-current rounded-full block" />
                                </button>
                                <span className="font-display text-lg w-8 text-center text-sb-black">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:text-sb-black transition-colors"
                                    aria-label="Increase"
                                >
                                    <div className="relative w-3 h-3">
                                        <span className="absolute top-1/2 left-0 w-3 h-0.5 -mt-px bg-current rounded-full block" />
                                        <span className="absolute top-0 left-1/2 w-0.5 h-3 -ml-px bg-current rounded-full block" />
                                    </div>
                                </button>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdded || !inStock}
                                className={`flex-1 flex justify-between items-center px-6 py-4 rounded-full shadow-lg transition-all duration-300 ${!inStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                    : isAdded
                                        ? 'bg-sb-black text-white shadow-sb-black/10'
                                        : 'bg-sb-green text-white hover:bg-sb-dark shadow-sb-green/25 hover:-translate-y-0.5'
                                    }`}
                            >
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-75">
                                        {!inStock ? (t('outOfStock') || 'Out of Stock') : isAdded ? t('addToCartSuccess') : t('total')}
                                    </span>
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={isAdded ? 'added' : !inStock ? 'oos' : 'price'}
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -10, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="font-display text-2xl leading-none"
                                        >
                                            {!inStock ? '✕' : isAdded ? '✓' : `€${(unitPrice * quantity).toFixed(2)}`}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isAdded ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                                        >
                                            <Check size={16} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="arrow"
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                                                {t('addToCart')}
                                            </span>
                                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                                <ArrowRight size={14} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
