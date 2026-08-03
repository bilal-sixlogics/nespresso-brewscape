"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown, ArrowRight, Star, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFormatPrice } from '@/context/SiteSettingsContext';
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
        <div className="relative h-56 sm:h-64 md:h-72 bg-sand flex items-center justify-center overflow-hidden mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-[24px] sm:rounded-[32px] shadow-sm border border-ink/10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-ink/5 to-transparent" />
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
                        className="h-full w-full object-cover rounded-[inherit] drop-shadow-[0_20px_30px_rgba(0,0,0,0.25)] relative z-10"
                    />
                ) : (
                    <div className="text-cocoa/40 text-6xl">☕</div>
                )}
            </AnimatePresence>
            {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                            className={`rounded-full transition-all duration-300 ${i === imgIdx ? 'w-4 h-1.5 bg-ink' : 'w-1.5 h-1.5 bg-ink/30'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Accordion ─────────────────────────────────────────────────────────────
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    return (
        <div className={`rounded-2xl border-2 transition-colors duration-200 bg-sand ${open ? 'border-gold/40' : 'border-cocoa/15 hover:border-gold/30'}`}>
            <button
                onClick={() => setOpen(p => !p)}
                className="w-full flex justify-between items-center px-4 py-3.5 text-left group cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-200 ${open ? 'bg-gold text-ink' : 'bg-ink/5 text-cocoa group-hover:bg-gold/10 group-hover:text-gold'}`}>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-200 ${open ? 'text-ink' : 'text-ink/70 group-hover:text-ink'}`}>{title}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${open ? 'text-gold' : 'text-cocoa/60 group-hover:text-gold/60'}`}>
                    {open ? t('close') : t('readMore')}
                </span>
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
                        <div className="px-4 pb-4 text-sm text-ink/70 leading-relaxed border-t border-cocoa/15 pt-3">{children}</div>
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
    const formatPrice = useFormatPrice();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<SaleUnit | null>(null);
    // Portals require a DOM node — only available once mounted on the client.
    const [mounted, setMounted] = useState(false);
    React.useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Reset state when product changes
    React.useEffect(() => {
        setQuantity(1);
        setIsAdded(false);
        setIsRedirecting(false);
        setSelectedUnit(null);
    }, [product?.id]);

    // Lock body scroll and handle Escape key while panel is open
    React.useEffect(() => {
        if (!product) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [product, onClose]);

    if (!product || !mounted) return null;

    const inStock = isInStock(product);
    const productIsNew = isNewProduct(product);
    const isBestSeller = hasTag(product, 'best-seller');

    // Determine the effective sale unit
    const defaultUnit = getDefaultUnit(product);
    const effectiveUnit: SaleUnit = selectedUnit ?? defaultUnit ?? {
        id: 0,
        name: t('defaultUnit'),
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

    return createPortal(
        <AnimatePresence>
            {product && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] cursor-pointer"
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
                        className="fixed top-0 right-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-ink z-[10001] shadow-2xl overflow-y-auto overflow-x-hidden border-l border-sand/10 flex flex-col grain-overlay"
                    >
                        {/* ── Sticky Header ──────────────────────────── */}
                        <div className="sticky top-0 bg-ink/90 backdrop-blur-xl border-b border-sand/10 z-20 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
                            <button
                                onClick={onClose}
                                aria-label={t('ariaCloseProductPanel')}
                                className="flex items-center gap-2 text-sand opacity-60 hover:opacity-100 transition-opacity group focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 rounded-full"
                            >
                                <div className="w-10 h-10 rounded-full bg-sand text-ink flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border border-sand/20">
                                    <ArrowLeft size={14} />
                                </div>
                                <span className="text-[10px] font-bold tracking-widest uppercase">{t('keepExploring')}</span>
                            </button>

                            {/* Tags + Stock */}
                            <div className="flex gap-1.5 flex-wrap">
                                {productIsNew && (
                                    <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 bg-gold text-ink rounded-full">{t('new')}</span>
                                )}
                                {isBestSeller && (
                                    <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 bg-sand text-ink rounded-full">{t('bestSeller')}</span>
                                )}
                                <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${inStock ? 'bg-gold text-white border border-gold' : 'bg-red-50 text-red-500 border border-red-200'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-gold text-white animate-pulse' : 'bg-red-400'}`} />
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
                                        <h2 className="font-display text-2xl sm:text-3xl uppercase leading-[0.9] text-sand">
                                            {displayName}
                                        </h2>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-3xl sm:text-4xl text-gold leading-none">{formatPrice(unitPrice)}</div>
                                    </div>
                                </div>

                                {displayTagline && (
                                    <p className="text-xs text-cocoa italic !mt-1">{displayTagline}</p>
                                )}

                                {/* ── Compact Sale Units ── */}
                                {product.sales_units && product.sales_units.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-cocoa mb-2">{t('selectPack')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {product.sales_units.map(unit => {
                                                const isActive = effectiveUnit.id === unit.id;
                                                return (
                                                    <button
                                                        key={unit.id}
                                                        onClick={() => setSelectedUnit(unit)}
                                                        className={`px-4 py-2 rounded-xl border-2 transition-all flex flex-col ${isActive
                                                            ? 'border-gold bg-gold/10 text-gold'
                                                            : 'border-sand/15 bg-sand/8 text-sand hover:border-gold/30'
                                                            }`}
                                                    >
                                                        <span className="text-[9px] font-bold uppercase">{unit.name}</span>
                                                        <span className="text-[10px] font-black opacity-80">{formatPrice(Number(unit.selling_price))}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ── Quick Specs ── */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {product.intensity != null && product.intensity > 0 && (
                                        <div className="bg-sand/8 p-3 rounded-2xl border border-sand/10">
                                            <IntensityBar intensity={product.intensity} size="panel" />
                                        </div>
                                    )}
                                </div>

                                {/* ── Aromatic Profile ── */}
                                {notes && notes.length > 0 && (
                                    <div className="bg-sand p-4 rounded-[20px] text-ink">
                                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-60 mb-2">{t('aromaticProfile')}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {notes.map(note => (
                                                <span key={note} className="bg-ink/10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-ink/10">
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
                                        className={`w-full group flex items-center justify-between p-4 bg-sand/8 border border-sand/10 rounded-[20px] transition-all text-left ${isRedirecting ? 'opacity-70 cursor-not-allowed' : 'hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isRedirecting
                                                ? 'bg-gold text-ink'
                                                : 'bg-gold/10 border border-gold/20 text-gold group-hover:bg-gold group-hover:text-ink'
                                                }`}>
                                                {isRedirecting ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <ArrowRight size={16} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gold mb-0.5">
                                                    {isRedirecting ? t('loading') : t('fullExperience')}
                                                </p>
                                                <p className="text-xs font-bold text-sand/70 group-hover:opacity-100 transition-opacity">
                                                    {isRedirecting ? t('optimizingRedirect') : t('fullExperienceDesc')}
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
                        <div className="sticky bottom-0 bg-ink border-t border-sand/10 px-4 sm:px-6 py-3 sm:py-4 z-20 flex gap-2 sm:gap-3 items-center flex-shrink-0">

                            {/* Quantity */}
                            <div className="flex items-center border-2 border-sand/15 rounded-full p-1.5 bg-sand/5 flex-shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 rounded-full bg-sand/10 hover:bg-sand/20 shadow-sm flex items-center justify-center text-sand/60 hover:text-sand transition-colors"
                                    aria-label={t('ariaDecrease')}
                                >
                                    <span className="w-3 h-0.5 bg-current rounded-full block" />
                                </button>
                                <span className="font-display text-lg w-8 text-center text-sand">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 rounded-full bg-sand/10 hover:bg-sand/20 shadow-sm flex items-center justify-center text-sand/60 hover:text-sand transition-colors"
                                    aria-label={t('ariaIncrease')}
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
                                    ? 'bg-sand/10 text-sand/30 cursor-not-allowed shadow-none'
                                    : isAdded
                                        ? 'bg-sand text-ink shadow-sand/10'
                                        : 'bg-gold text-ink hover:bg-[#b8914d] shadow-gold/25 hover:-translate-y-0.5'
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
                                            className="font-bold font-black text-black text-2xl leading-none"
                                        >
                                            {!inStock ? '✕' : isAdded ? '✓' : formatPrice(unitPrice * quantity)}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isAdded ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            className="w-10 h-10 bg-ink/15 rounded-full flex items-center justify-center"
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
                                            <div className="w-10 h-10 bg-ink/15 rounded-full flex items-center justify-center">
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
        </AnimatePresence>,
        document.body
    );
}
