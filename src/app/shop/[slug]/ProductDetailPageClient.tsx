"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, ShoppingBag, Check, ArrowRight, Share2, Heart, ArrowLeft, X, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { enrichedProducts } from '@/lib/productsData';
import publicApi from '@/lib/publicApi';
import { useCart } from '@/store/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { SaleUnit, Product } from '@/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailPanel } from '@/components/ui/ProductDetailPanel';
import { IntensityBar } from '@/components/ui/IntensityBar';
import { RichText } from '@/components/ui/RichText';

// ─── Sub-components ──────────────────────────────────────────────────────────


function TasteBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 w-24 flex-shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / max) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-sb-green/60 to-sb-green rounded-full"
                />
            </div>
            <span className="text-xs text-gray-400 font-bold w-4 text-right">{value}</span>
        </div>
    );
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={14} className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                ))}
            </div>
            <span className="text-sm font-bold text-sb-black">{rating.toFixed(1)}</span>
            {count != null && <span className="text-xs text-gray-400">({count} avis)</span>}
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
    const t = (fr: string, en: string) => language === 'fr' ? fr : en;

    // Try API first, fall back to local data
    const [apiProduct, setApiProduct] = useState<Product | null>(null);
    const [apiRelated, setApiRelated] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        publicApi.product(slug).then(p => {
            if (p) {
                setApiProduct(p);
                // Load related products by category
                if (p.category) {
                    const catSlugMap: Record<string, string> = {
                        'Café en Grains': 'cafe-en-grains', 'Café Moulu': 'cafe-moulu',
                        'Capsules de Café': 'capsules-de-cafe', 'Machines à Café': 'machines-a-cafe',
                        'Accessoires': 'accessoires', 'Friandises': 'friandises',
                    };
                    const catSlug = catSlugMap[p.category];
                    if (catSlug) {
                        publicApi.byCategory(catSlug, 8).then(ps =>
                            setApiRelated(ps.filter(rp => String(rp.id) !== String(p.id)).slice(0, 4))
                        ).catch(() => {});
                    }
                }
            }
        }).catch(() => {}).finally(() => setLoading(false));
    }, [slug]);

    const localProduct = enrichedProducts.find(p => p.slug === slug || String(p.id) === slug);
    const product = (apiProduct || localProduct) as Product | undefined;

    const [quantity, setQuantity] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState<SaleUnit | null>(null);
    const [isAdded, setIsAdded] = useState(false);
    const [activeImg, setActiveImg] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
    const [wishlist, setWishlist] = useState(false);
    const [panelProduct, setPanelProduct] = useState<Product | null>(null);

    if (loading && !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-sb-white gap-4">
                <div className="w-8 h-8 border-2 border-sb-green border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Chargement…</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-sb-white gap-6 px-8">
                <p className="text-6xl">☕</p>
                <h1 className="font-display text-4xl uppercase">{t('Produit introuvable', 'Product Not Found')}</h1>
                <Link href="/shop" className="bg-sb-green text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase">
                    {t('Retour à la boutique', 'Back to Shop')}
                </Link>
            </div>
        );
    }

    const images = product.images && product.images.length > 0 ? product.images : [product.image];

    // Auto-scroll carousel
    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(() => setActiveImg(p => (p + 1) % images.length), 4000);
        return () => clearInterval(timer);
    }, [images.length]);

    const effectiveUnit: SaleUnit = selectedUnit ?? (product.saleUnits?.[0] ?? {
        id: 'default', label: product.namePart2 ?? 'Unité', price: product.price, originalPrice: product.originalPrice, quantity: 1,
    });
    const unitPrice = effectiveUnit.price;
    const originalUnitPrice = effectiveUnit.originalPrice;
    const hasDiscount = !!originalUnitPrice && originalUnitPrice > unitPrice;
    const discountPct = hasDiscount ? Math.round((1 - unitPrice / originalUnitPrice!) * 100) : 0;

    const displayName = language === 'fr' ? product.name : (product.nameEn ?? product.name);
    const displayPart2 = language === 'fr' ? product.namePart2 : (product.namePart2En ?? product.namePart2);
    const displayTagline = language === 'fr' ? product.tagline : (product.taglineEn ?? product.tagline);
    const displayDesc = language === 'fr' ? product.desc : (product.descEn ?? product.desc);

    const relatedProducts = apiRelated.length > 0
        ? apiRelated
        : (enrichedProducts as Product[]).filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);

    const handleAddToCart = () => {
        addToCart(product, effectiveUnit, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const avgRating = product.averageRating ?? (product.reviews?.length
        ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
        : null);

    return (
        <div className="bg-[#FAF9F6] min-h-screen">
            {/* ── Breadcrumb ────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-8 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <Link href="/" className="hover:text-sb-green transition-colors">{t('Accueil', 'Home')}</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-sb-green transition-colors">{t('Boutique', 'Shop')}</Link>
                    {product.category && <><span>/</span><Link href="/shop" className="hover:text-sb-green transition-colors">{product.category}</Link></>}
                    <span>/</span>
                    <span className="text-sb-black truncate max-w-[180px]">{displayName}</span>
                </div>
            </div>

            {/* ── Main Layout ──────────────────────────────────── */}
            <div className="max-w-[1400px] mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start">
                {/* ── Image Gallery ── */}
                <div className="sticky top-8">
                    {/* Main image — clickable lightbox */}
                    <div
                        className="bg-[#60A17B] rounded-[48px] overflow-hidden relative border border-white/30 cursor-zoom-in group"
                        style={{ aspectRatio: '1/1' }}
                        onClick={() => setLightboxOpen(true)}
                    >
                        {hasDiscount && (
                            <div className="absolute top-6 left-6 z-10 bg-red-500 text-white text-sm font-black rounded-full px-4 py-2 shadow-lg">-{discountPct}%</div>
                        )}
                        {product.isNew && !hasDiscount && (
                            <div className="absolute top-6 left-6 z-10 bg-sb-black text-white text-sm font-black rounded-full px-4 py-2">NEW</div>
                        )}
                        <button onClick={e => { e.stopPropagation(); setWishlist(w => !w); }}
                            className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                            <Heart size={18} className={wishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setLightboxOpen(true); }}
                            className="absolute bottom-6 right-6 z-10 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 size={14} className="text-white" />
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
                                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${i === activeImg ? 'border-sb-green scale-105 shadow-lg shadow-sb-green/20' : 'border-gray-100 opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-contain p-1" />
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
                            {product.tags?.includes('best-seller') && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400 text-white px-3 py-1.5 rounded-full flex items-center gap-1"><Star size={9} fill="white" /> Best Seller</span>
                            )}
                            {product.isNew && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-sb-black text-white px-3 py-1.5 rounded-full">Nouveau</span>
                            )}
                            {product.tags?.includes('eco-friendly') && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1.5 rounded-full">♻️ Éco</span>
                            )}
                            {product.category && (
                                <span className="text-[9px] font-bold uppercase tracking-widest text-sb-green border border-sb-green/30 px-3 py-1.5 rounded-full">{product.category}</span>
                            )}
                        </div>
                        <h1 className="font-display text-5xl xl:text-6xl uppercase leading-tight text-sb-black mb-2">
                            {displayName}
                            {displayPart2 && <span className="text-gray-300 block text-4xl">{displayPart2}</span>}
                        </h1>
                        {displayTagline && <p className="text-gray-400 italic text-base">{displayTagline}</p>}
                        {avgRating && (
                            <div className="mt-3">
                                <StarRating rating={avgRating} count={product.reviews?.length} />
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-4">
                        <span className="font-display text-6xl text-sb-green">€{unitPrice.toFixed(2)}</span>
                        {hasDiscount && <span className="text-2xl text-gray-300 line-through">€{originalUnitPrice!.toFixed(2)}</span>}
                        {hasDiscount && <span className="text-sm bg-red-50 text-red-500 font-bold px-3 py-1 rounded-full">-{discountPct}%</span>}
                    </div>

                    {/* Intensity */}
                    {product.intensity != null && product.intensity > 0 && (
                        <div className="bg-white rounded-3xl p-6 border border-gray-100">
                            <IntensityBar intensity={product.intensity} size="page" />
                        </div>
                    )}

                    {/* Aromatic notes */}
                    {product.notes && product.notes.length > 0 && (
                        <div className="bg-sb-green rounded-3xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12" />
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-4">{t('Notes aromatiques', 'Aromatic Notes')}</p>
                            <div className="flex flex-wrap gap-2">
                                {product.notes.map(note => (
                                    <span key={note} className="bg-white/15 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-white/20">{note}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sale unit selector */}
                    {product.saleUnits && product.saleUnits.length > 1 && (
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">{t('Choisir le format', 'Choose Format')}</p>
                            <div className="flex flex-wrap gap-3">
                                {product.saleUnits.map(unit => {
                                    const active = effectiveUnit.id === unit.id;
                                    const label = language === 'fr' ? unit.label : (unit.labelEn ?? unit.label);
                                    return (
                                        <button
                                            key={unit.id}
                                            onClick={() => setSelectedUnit(unit)}
                                            className={`flex flex-col px-5 py-3 rounded-2xl border-2 transition-all ${active ? 'border-sb-green bg-sb-green/5 text-sb-green' : 'border-gray-100 bg-white hover:border-sb-green/30'}`}
                                        >
                                            <span className="text-xs font-bold">{label}</span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-base font-black">€{unit.price.toFixed(2)}</span>
                                                {unit.originalPrice && <span className="text-xs text-gray-300 line-through">€{unit.originalPrice.toFixed(2)}</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Qty + Add to cart */}
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center border-2 border-gray-100 rounded-full p-1.5 bg-gray-50">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
                                <span className="w-3.5 h-0.5 bg-gray-600 block rounded-full" />
                            </button>
                            <span className="font-display text-xl w-10 text-center">{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
                                <span className="relative w-3.5 h-3.5 block">
                                    <span className="absolute top-1/2 left-0 w-full h-0.5 -mt-px bg-gray-600 block rounded-full" />
                                    <span className="absolute top-0 left-1/2 w-0.5 h-full -ml-px bg-gray-600 block rounded-full" />
                                </span>
                            </button>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`flex-1 flex justify-between items-center px-7 py-4 rounded-full shadow-lg transition-all duration-300 ${isAdded ? 'bg-sb-black text-white' : 'bg-sb-green text-white hover:bg-[#2C6345] shadow-sb-green/25'}`}
                        >
                            <div>
                                <p className="text-[8px] font-bold tracking-widest uppercase opacity-75">{isAdded ? t('Ajouté !', 'Added!') : t('Total', 'Total')}</p>
                                <p className="font-display text-2xl leading-none">
                                    {isAdded ? '✓' : `€${(unitPrice * quantity).toFixed(2)}`}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                {isAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
                            </div>
                        </motion.button>
                        <button
                            className="w-14 h-14 border-2 border-gray-100 rounded-full flex items-center justify-center hover:border-sb-green transition-colors flex-shrink-0"
                            title={t('Partager', 'Share')}
                        >
                            <Share2 size={18} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Shipping note */}
                    <p className="text-xs text-gray-400 text-center">
                        {t('🚚 Livraison offerte dès 150€ · Retours sous 14 jours', '🚚 Free shipping from €150 · Returns within 14 days')}
                    </p>
                </div>
            </div>

            {/* ── Tabs: Description / Specs / Reviews ──────────── */}
            <div className="max-w-[1400px] mx-auto px-8 pb-24">
                <div className="border-b border-gray-200 flex gap-8 mb-12">
                    {(['description', 'specs', 'reviews'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all duration-200 -mb-px ${activeTab === tab ? 'border-sb-green text-sb-green' : 'border-transparent text-gray-400 hover:text-sb-black'}`}
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
                                <p className="text-gray-400 italic">{t('Aucune description disponible.', 'No description available.')}</p>
                            )}
                            {product.tasteProfile && (
                                <div className="mt-12 bg-white rounded-3xl p-8 border border-gray-100">
                                    <h3 className="font-display text-2xl uppercase mb-6">{t('Profil Gustatif', 'Taste Profile')}</h3>
                                    <div className="space-y-4">
                                        {product.tasteProfile.bitterness != null && <TasteBar label={t('Amertume', 'Bitterness')} value={product.tasteProfile.bitterness} />}
                                        {product.tasteProfile.acidity != null && <TasteBar label={t('Acidité', 'Acidity')} value={product.tasteProfile.acidity} />}
                                        {product.tasteProfile.roastiness != null && <TasteBar label={t('Torréfaction', 'Roastiness')} value={product.tasteProfile.roastiness} />}
                                        {product.tasteProfile.body != null && <TasteBar label={t('Corps', 'Body')} value={product.tasteProfile.body} />}
                                        {product.tasteProfile.sweetness != null && <TasteBar label={t('Douceur', 'Sweetness')} value={product.tasteProfile.sweetness} />}
                                    </div>
                                </div>
                            )}
                            {product.features?.map((feat, i) => {
                                const title = language === 'fr' ? feat.title : (feat.titleEn ?? feat.title);
                                const items = language === 'fr' ? feat.items : (feat.itemsEn ?? feat.items);
                                return (
                                    <div key={i} className="mt-8 bg-white rounded-3xl p-8 border border-gray-100">
                                        <h3 className="font-display text-2xl uppercase mb-4">{title}</h3>
                                        <ul className="space-y-2">
                                            {items.map((item, j) => (
                                                <li key={j} className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-sb-green mt-2 flex-shrink-0" />
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
                            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                                {[
                                    product.intensity != null && { label: t('Intensité', 'Intensity'), value: `${product.intensity} / 13` },
                                    product.roastLevel && { label: t('Torréfaction', 'Roast Level'), value: product.roastLevel },
                                    product.origin && { label: t('Origine', 'Origin'), value: product.origin },
                                    product.processingMethod && { label: t('Méthode', 'Process'), value: product.processingMethod },
                                    product.weight && { label: 'Poids', value: product.weight },
                                    product.brewSizes && { label: t('Formats', 'Brew Sizes'), value: product.brewSizes.join(', ') },
                                    product.allergens && { label: t('Allergènes', 'Allergens'), value: product.allergens.join(', ') },
                                ].filter(Boolean).map((spec: any, i) => (
                                    <div key={i} className={`flex justify-between items-center px-6 py-4 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{spec.label}</span>
                                        <span className="text-sm font-bold text-sb-black">{spec.value}</span>
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
                                        <div className="bg-white rounded-3xl p-8 border border-gray-100 mb-8 flex items-center gap-10">
                                            <div className="text-center">
                                                <p className="font-display text-7xl text-sb-green">{avgRating.toFixed(1)}</p>
                                                <StarRating rating={avgRating} />
                                                <p className="text-xs text-gray-400 mt-1">{product.reviews.length} {t('avis', 'reviews')}</p>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                {[5, 4, 3, 2, 1].map(star => {
                                                    const count = product.reviews!.filter(r => r.rating === star).length;
                                                    const pct = (count / product.reviews!.length) * 100;
                                                    return (
                                                        <div key={star} className="flex items-center gap-3">
                                                            <span className="text-xs text-gray-400 w-4">{star}</span>
                                                            <Star size={10} className="text-amber-400 fill-amber-400" />
                                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${pct}%` }}
                                                                    transition={{ duration: 0.8, delay: 0.1 * (5 - star) }}
                                                                    className="h-full bg-amber-400 rounded-full"
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {/* Individual reviews */}
                                    <div className="space-y-4">
                                        {product.reviews.map(rev => (
                                            <div key={rev.id} className="bg-white rounded-3xl p-6 border border-gray-100">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <p className="font-bold text-sm text-sb-black">{rev.user}</p>
                                                        {rev.verified && <p className="text-[9px] text-sb-green font-bold uppercase tracking-wider mt-0.5">✓ {t('Achat vérifié', 'Verified Purchase')}</p>}
                                                    </div>
                                                    <StarRating rating={rev.rating} />
                                                </div>
                                                {rev.title && <p className="font-bold text-sm text-gray-700 mb-1">{rev.title}</p>}
                                                <p className="text-sm text-gray-500 leading-relaxed">{rev.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-5xl mb-4">⭐</p>
                                    <p className="font-bold text-xl mb-2">{t('Aucun avis pour l\'instant', 'No reviews yet')}</p>
                                    <p className="text-gray-400 text-sm">{t('Soyez le premier à partager votre expérience', 'Be the first to share your experience')}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Related Products ─────────────────────────────── */}
            {relatedProducts.length > 0 && (
                <section className="bg-white py-20 px-8 border-t border-gray-100">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="font-display text-4xl uppercase">{t('Vous aimerez aussi', 'You Might Also Like')}</h2>
                            <Link href="/shop" className="flex items-center gap-2 text-sb-green text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all">
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
