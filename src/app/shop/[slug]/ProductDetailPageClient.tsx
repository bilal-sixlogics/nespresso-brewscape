"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, ShoppingBag, Check, ArrowRight, Share2, Heart, ArrowLeft, X, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFormatPrice, useSiteSettings } from '@/context/SiteSettingsContext';
import { useProduct, useProducts } from '@/hooks/useProducts';
import {
    SaleUnit, Product,
    extractTasteProfile, extractNotes, extractFeatures, extractSpecField,
    getProductImage, getProductImages, getDisplayPrice, getDefaultUnit,
    isInStock, isNewProduct, hasTag,
} from '@/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailPanel } from '@/components/ui/ProductDetailPanel';
import { IntensityBar } from '@/components/ui/IntensityBar';
import { RichText } from '@/components/ui/RichText';
import { TrustIndicators } from '@/components/ui/TrustIndicators';

// ─── Sub-components ──────────────────────────────────────────────────────────


function TasteBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cocoa w-24 flex-shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-sand/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / max) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full"
                />
            </div>
            <span className="text-xs text-cocoa font-bold w-4 text-right">{value}</span>
        </div>
    );
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={14} className={i <= Math.round(rating) ? 'text-gold fill-gold' : 'text-sand/15 fill-sand/15'} />
                ))}
            </div>
            <span className="text-sm font-bold text-sand">{rating.toFixed(1)}</span>
            {count != null && <span className="text-xs text-cocoa">({count} avis)</span>}
        </div>
    );
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button onClick={() => setOpen(p => !p)} className="w-full flex justify-between items-center py-5 text-left group">
                <span className="font-bold text-sm text-sb-black group-hover:text-sb-green transition-colors">{title}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} className="text-gray-300" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }} className="overflow-hidden"
                    >
                        <div className="pb-5 text-sm text-gray-500 leading-relaxed">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main PDP Component ───────────────────────────────────────────────────────
export default function ProductDetailPageClient({ slug }: { slug: string }) {
    const { addToCart } = useCart();
    const { language } = useLanguage();
    const formatPrice = useFormatPrice();
    const { currency_symbol } = useSiteSettings();
    const t = (fr: string, en: string) => language === 'fr' ? fr : en;

    const { product, isLoading: productLoading } = useProduct(slug);

    const [quantity, setQuantity] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState<SaleUnit | null>(null);
    const [isAdded, setIsAdded] = useState(false);
    const [activeImg, setActiveImg] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
    const [wishlist, setWishlist] = useState(false);
    const [panelProduct, setPanelProduct] = useState<Product | null>(null);
    const [shareCopied, setShareCopied] = useState(false);

    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({ title: product?.name ?? '', url });
            } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
            }
        } catch {
            // user cancelled the native share sheet — no-op
        }
    };

    // Derive image list — safe to compute before hooks (no hooks below yet)
    const imageUrls = product ? getProductImages(product) : [];
    const images = imageUrls.length > 0 ? imageUrls : (product ? [getProductImage(product) ?? '/placeholder.png'] : ['/placeholder.png']);

    // Auto-scroll carousel — must be called unconditionally (before any early returns)
    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(() => setActiveImg(p => (p + 1) % images.length), 4000);
        return () => clearInterval(timer);
    }, [images.length]);

    // Fetch related products — must be called unconditionally (before any early returns)
    const relatedParams = useMemo(() => ({
        category_id: product?.category_id,
        per_page: 5,
    }), [product?.category_id]);
    const { products: relatedProductsRaw } = useProducts(relatedParams);
    const relatedProducts = relatedProductsRaw.filter(p => p.id !== product?.id).slice(0, 4);

    // ── Early returns after all hooks ──────────────────────────────────────────
    if (productLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-ink gap-6">
                <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-ink text-sand gap-6 px-8">
                <p className="text-6xl">☕</p>
                <h1 className="font-display text-4xl uppercase">{t('Produit introuvable', 'Product Not Found')}</h1>
                <Link href="/shop" className="bg-gold text-ink px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase">
                    {t('Retour à la boutique', 'Back to Shop')}
                </Link>
            </div>
        );
    }

    const notes = extractNotes(product.sections);
    const tasteProfile = extractTasteProfile(product.sections);
    const features = extractFeatures(product.sections);
    const productIsNew = isNewProduct(product);

    const defaultUnit = getDefaultUnit(product);
    const effectiveUnit: SaleUnit = selectedUnit ?? (defaultUnit ?? {
        id: 0, name: 'Unité', unit_type: 'pc', quantity: 1, selling_price: product.selling_price,
        pricing_method: 'direct' as const, sku: '', stock: product.stock_qty, is_default: true, status: 'active' as const,
    });
    const unitPrice = Number(effectiveUnit.selling_price) || 0;
    const hasDiscount = false; // discount logic now lives in sale unit pricing_method
    const discountPct = 0;

    const displayName = product.name;
    const displayPart2 = defaultUnit?.name;
    const displayTagline = product.tagline;
    const displayDesc = product.description;

    const handleAddToCart = () => {
        addToCart(product, effectiveUnit, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const avgRating = product.average_rating ?? (product.reviews?.length
        ? product.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / product.reviews.length
        : null);

    return (
        <div className="bg-ink text-sand min-h-screen grain-overlay">
            {/* ── Breadcrumb ────────────────────────────────────── */}
            <div className="bg-sand/5 border-b border-sand/10 px-8 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cocoa">
                    <Link href="/" className="hover:text-gold transition-colors">{t('Accueil', 'Home')}</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-gold transition-colors">{t('Boutique', 'Shop')}</Link>
                    {product.category && <><span>/</span><Link href="/shop" className="hover:text-gold transition-colors">{product.category.name}</Link></>}
                    <span>/</span>
                    <span className="text-sand truncate max-w-[180px]">{displayName}</span>
                </div>
            </div>

            {/* ── Main Layout ──────────────────────────────────── */}
            <div className="max-w-[1400px] mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start">
                {/* ── Image Gallery ── */}
                <div className="sticky top-[var(--header-h,112px)]">
                    {/* Main image — clickable lightbox */}
                    <div
                        className="bg-sand rounded-[48px] overflow-hidden relative border border-ink/10 cursor-zoom-in group"
                        style={{ aspectRatio: '1/1' }}
                        onClick={() => setLightboxOpen(true)}
                    >
                        {hasDiscount && (
                            <div className="absolute top-6 left-6 z-10 bg-red-500 text-white text-sm font-black rounded-full px-4 py-2 shadow-lg">-{discountPct}%</div>
                        )}
                        {productIsNew && !hasDiscount && (
                            <div className="absolute top-6 left-6 z-10 bg-gold text-ink text-sm font-black rounded-full px-4 py-2">{ t('new','New') }</div>
                        )}
                        <button onClick={e => { e.stopPropagation(); setWishlist(w => !w); }}
                            className="absolute top-6 right-6 z-10 w-12 h-12 bg-ink/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                            <Heart size={18} className={wishlist ? 'fill-red-500 text-red-500' : 'text-cocoa'} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setLightboxOpen(true); }}
                            className="absolute bottom-6 right-6 z-10 w-10 h-10 bg-ink/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 size={14} className="text-sand" />
                        </button>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeImg}
                                initial={{ opacity: 0, scale: 1.04 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                src={images[activeImg]}
                                alt={displayName}
                                className="w-full h-full object-cover rounded-[inherit] drop-shadow-[0_40px_60px_rgba(0,0,0,0.2)]"
                            />
                        </AnimatePresence>
                    </div>

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                        <div className="flex gap-3 mt-4 justify-center">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${i === activeImg ? 'border-gold shadow-lg shadow-gold/20' : 'border-sand/15 opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Purchase Column ── */}
                <div className="flex flex-col gap-8">
                    {/* Title & tags */}
                    <div>
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {hasTag(product, 'best-seller') && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-sand text-ink px-3 py-1.5 rounded-full flex items-center gap-1"><Star size={9} fill="#1A1614" /> Best Seller</span>
                            )}
                            {productIsNew && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-gold text-ink px-3 py-1.5 rounded-full">Nouveau</span>
                            )}
                            {hasTag(product, 'eco-friendly') && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1.5 rounded-full">♻️ Éco</span>
                            )}
                            {product.category && (
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gold border border-gold/30 px-3 py-1.5 rounded-full">{product.category.name}</span>
                            )}
                        </div>
                        <h1 className="font-display text-5xl xl:text-6xl uppercase leading-tight text-sand mb-2">
                            {displayName}
                            {displayPart2 && <span className="text-sand/40 block text-4xl">{displayPart2}</span>}
                        </h1>
                        {displayTagline && <p className="text-cocoa italic text-base">{displayTagline}</p>}
                        {avgRating && (
                            <div className="mt-3">
                                <StarRating rating={avgRating} count={product.reviews?.length} />
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-4">
                        <span className="font-bold text-6xl text-gold">{formatPrice(unitPrice)}</span>
                    </div>

                    {/* Intensity */}
                    {product.intensity != null && product.intensity > 0 && (
                        <div className="bg-sand/8 rounded-3xl p-6 border border-sand/10">
                            <IntensityBar intensity={product.intensity} size="page" />
                        </div>
                    )}

                    {/* Aromatic notes */}
                    {notes && notes.length > 0 && (
                        <div className="bg-sand rounded-3xl p-6 text-ink relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-ink/5 rounded-full blur-3xl -mr-12 -mt-12" />
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-4">{t('Notes aromatiques', 'Aromatic Notes')}</p>
                            <div className="flex flex-wrap gap-2">
                                {notes.map((note: string) => (
                                    <span key={note} className="bg-ink/10 backdrop-blur-sm text-ink text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-ink/10">{note}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sale unit selector */}
                    {product.sales_units && product.sales_units.length > 1 && (
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-cocoa mb-3">{t('Choisir le format', 'Choose Format')}</p>
                            <div className="flex flex-wrap gap-3">
                                {product.sales_units.map((unit: SaleUnit) => {
                                    const active = effectiveUnit.id === unit.id;
                                    return (
                                        <button
                                            key={unit.id}
                                            onClick={() => setSelectedUnit(unit)}
                                            className={`flex flex-col px-5 py-3 rounded-2xl border-2 transition-all ${active ? 'border-gold bg-gold/10 text-gold' : 'border-sand/15 bg-sand/8 text-sand hover:border-gold/30'}`}
                                        >
                                            <span className="text-xs font-bold">{unit.name}</span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-base font-black">{formatPrice(Number(unit.selling_price))}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Qty + Add to cart */}
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center border-2 border-sand/15 rounded-full p-1.5 bg-sand/5">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 h-11 rounded-full bg-sand/10 shadow-sm flex items-center justify-center hover:bg-sand/20 transition-colors">
                                <span className="w-3.5 h-0.5 bg-sand block rounded-full" />
                            </button>
                            <span className="font-display text-xl w-10 text-center text-sand">{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="w-11 h-11 rounded-full bg-sand/10 shadow-sm flex items-center justify-center hover:bg-sand/20 transition-colors">
                                <span className="relative w-3.5 h-3.5 block">
                                    <span className="absolute top-1/2 left-0 w-full h-0.5 -mt-px bg-sand block rounded-full" />
                                    <span className="absolute top-0 left-1/2 w-0.5 h-full -ml-px bg-sand block rounded-full" />
                                </span>
                            </button>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`flex-1 flex justify-between items-center px-7 py-4 rounded-full shadow-lg transition-all duration-300 ${isAdded ? 'bg-sand text-ink' : 'bg-gold text-ink hover:bg-[#b8914d] shadow-gold/25'}`}
                        >
                            <div>
                                <p className="text-[8px] font-bold tracking-widest uppercase opacity-75">{isAdded ? t('Ajouté !', 'Added!') : t('Total', 'Total')}</p>
                                <p className="font-bold font-black text-black text-2xl leading-none">
                                    {isAdded ? '✓' : formatPrice(unitPrice * quantity)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-ink/15 rounded-full flex items-center justify-center">
                                {isAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
                            </div>
                        </motion.button>
                        <button
                            onClick={handleShare}
                            className="relative w-14 h-14 border-2 border-sand/15 rounded-full flex items-center justify-center hover:border-gold transition-colors flex-shrink-0"
                            title={t('Partager', 'Share')}
                        >
                            <Share2 size={18} className="text-cocoa" />
                            {shareCopied && (
                                <span className="absolute -top-9 right-0 whitespace-nowrap bg-sand text-ink text-[10px] font-bold px-3 py-1.5 rounded-full">
                                    {t('Lien copié', 'Link copied')}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Shipping note */}
                    <p className="text-xs text-cocoa text-center">
                        {t(`🚚 Livraison offerte dès ${currency_symbol}150 · Retours sous 14 jours`, `🚚 Free shipping from ${currency_symbol}150 · Returns within 14 days`)}
                    </p>

                    {/* Trust indicators — delivery & roasting */}
                    {/* <TrustIndicators /> */}
                </div>
            </div>

            {/* ── Tabs: Description / Specs / Reviews ──────────── */}
            <div className="max-w-[1400px] mx-auto px-8 pb-24">
                <div className="border-b border-sand/15 flex gap-8 mb-12">
                    {(['description', 'specs', 'reviews'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all duration-200 -mb-px ${activeTab === tab ? 'border-gold text-gold' : 'border-transparent text-cocoa hover:text-sand'}`}
                        >
                            {tab === 'description' ? t('Description', 'Description') :
                                tab === 'specs' ? t('Caractéristiques', 'Specifications') :
                                    t(`Avis (${product.reviews?.length ?? 0})`, `Reviews (${product.reviews?.length ?? 0})`)}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'description' && (
                        <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
                            {displayDesc ? (
                                <RichText content={displayDesc} size="page" />
                            ) : (
                                <p className="text-cocoa italic">{t('Aucune description disponible.', 'No description available.')}</p>
                            )}
                            {tasteProfile && (
                                <div className="mt-12 bg-sand/8 rounded-3xl p-8 border border-sand/10">
                                    <h3 className="font-display text-2xl uppercase mb-6">{t('Profil Gustatif', 'Taste Profile')}</h3>
                                    <div className="space-y-4">
                                        {tasteProfile.bitterness != null && <TasteBar label={t('Amertume', 'Bitterness')} value={tasteProfile.bitterness} />}
                                        {tasteProfile.acidity != null && <TasteBar label={t('Acidité', 'Acidity')} value={tasteProfile.acidity} />}
                                        {tasteProfile.roastiness != null && <TasteBar label={t('Torréfaction', 'Roastiness')} value={tasteProfile.roastiness} />}
                                        {tasteProfile.body != null && <TasteBar label={t('Corps', 'Body')} value={tasteProfile.body} />}
                                        {tasteProfile.sweetness != null && <TasteBar label={t('Douceur', 'Sweetness')} value={tasteProfile.sweetness} />}
                                    </div>
                                </div>
                            )}
                            {features.map((feat: { title: string; titleEn?: string; items: string[]; itemsEn?: string[] }, i: number) => {
                                const title = language === 'fr' ? feat.title : (feat.titleEn ?? feat.title);
                                const items = language === 'fr' ? feat.items : (feat.itemsEn ?? feat.items);
                                return (
                                    <div key={i} className="mt-8 bg-sand/8 rounded-3xl p-8 border border-sand/10">
                                        <h3 className="font-display text-2xl uppercase mb-4">{title}</h3>
                                        <ul className="space-y-2">
                                            {items.map((item: string, j: number) => (
                                                <li key={j} className="flex items-start gap-3 text-sm text-sand/70">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'specs' && (
                        <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl">
                            <div className="bg-sand/8 rounded-3xl border border-sand/10 overflow-hidden">
                                {[
                                    product.intensity != null && { label: t('Intensité', 'Intensity'), value: `${product.intensity} / 13` },
                                    extractSpecField(product.sections, 'Roast') && { label: t('Torréfaction', 'Roast Level'), value: extractSpecField(product.sections, 'Roast')! },
                                    extractSpecField(product.sections, 'Origin') && { label: t('Origine', 'Origin'), value: extractSpecField(product.sections, 'Origin')! },
                                    extractSpecField(product.sections, 'Process') && { label: t('Méthode', 'Process'), value: extractSpecField(product.sections, 'Process')! },
                                    product.weight && { label: 'Poids', value: `${product.weight}` },
                                    extractSpecField(product.sections, 'Brew') && { label: t('Formats', 'Brew Sizes'), value: extractSpecField(product.sections, 'Brew')! },
                                    extractSpecField(product.sections, 'Allergen') && { label: t('Allergènes', 'Allergens'), value: extractSpecField(product.sections, 'Allergen')! },
                                ].filter((s): s is { label: string; value: string } => !!s).map((spec, i) => (
                                    <div key={i} className={`flex justify-between items-center px-6 py-4 ${i % 2 === 0 ? 'bg-sand/5' : ''}`}>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-cocoa">{spec.label}</span>
                                        <span className="text-sm font-bold text-sand">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'reviews' && (
                        <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
                            {product.reviews && product.reviews.length > 0 ? (
                                <>
                                    {/* Rating summary */}
                                    {avgRating && (
                                        <div className="bg-sand/8 rounded-3xl p-8 border border-sand/10 mb-8 flex items-center gap-10">
                                            <div className="text-center">
                                                <p className="font-display text-7xl text-gold">{avgRating.toFixed(1)}</p>
                                                <StarRating rating={avgRating} />
                                                <p className="text-xs text-cocoa mt-1">{product.reviews.length} {t('avis', 'reviews')}</p>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                {[5, 4, 3, 2, 1].map(star => {
                                                    const count = product.reviews!.filter((r: { rating: number }) => r.rating === star).length;
                                                    const pct = (count / product.reviews!.length) * 100;
                                                    return (
                                                        <div key={star} className="flex items-center gap-3">
                                                            <span className="text-xs text-cocoa w-4">{star}</span>
                                                            <Star size={10} className="text-gold fill-gold" />
                                                            <div className="flex-1 h-2 bg-sand/10 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${pct}%` }}
                                                                    transition={{ duration: 0.8, delay: 0.1 * (5 - star) }}
                                                                    className="h-full bg-gold rounded-full"
                                                                />
                                                            </div>
                                                            <span className="text-xs text-cocoa w-6 text-right">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {/* Individual reviews */}
                                    <div className="space-y-4">
                                        {product.reviews.map((rev: any) => (
                                            <div key={rev.id} className="bg-sand/8 rounded-3xl p-6 border border-sand/10">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <p className="font-bold text-sm text-sand">{rev.user_name}</p>
                                                        {rev.verified && <p className="text-[9px] text-gold font-bold uppercase tracking-wider mt-0.5">✓ {t('Achat vérifié', 'Verified Purchase')}</p>}
                                                    </div>
                                                    <StarRating rating={rev.rating} />
                                                </div>
                                                {rev.title && <p className="font-bold text-sm text-sand/80 mb-1">{rev.title}</p>}
                                                <p className="text-sm text-sand/60 leading-relaxed">{rev.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-5xl mb-4">⭐</p>
                                    <p className="font-bold text-xl mb-2 text-sand">{t('Aucun avis pour l\'instant', 'No reviews yet')}</p>
                                    <p className="text-cocoa text-sm">{t('Soyez le premier à partager votre expérience', 'Be the first to share your experience')}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Related Products ─────────────────────────────── */}
            {relatedProducts.length > 0 && (
                <section className="bg-ink grain-overlay py-20 px-8 border-t border-sand/10">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="font-display text-4xl uppercase text-sand">{t('Vous aimerez aussi', 'You Might Also Like')}</h2>
                            <Link href="/shop" className="flex items-center gap-2 text-gold text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all">
                                {t('Voir tout', 'View All')} <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((p, i) => (
                                <ProductCard key={p.id} product={p} onClick={setPanelProduct} index={i} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Panel for related products */}
            <ProductDetailPanel product={panelProduct} onClose={() => setPanelProduct(null)} />
        </div>
    );
}
