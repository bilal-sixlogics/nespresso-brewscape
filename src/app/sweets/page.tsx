"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { enrichedProducts } from '@/lib/productsData';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailPanel } from '@/components/ui/ProductDetailPanel';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

import { useDragScroll } from '@/hooks/useDragScroll';

const sweetProducts = enrichedProducts.filter(p =>
    p.category === "Friandises" || p.category === "Thé & Boissons"
);

const SWEET_TAGS = [
    { id: 'all', label: 'Toutes les Gourmandises', labelEn: 'All Treats' },
    { id: 'biscuits', label: 'Biscuits & Spéculoos', labelEn: 'Biscuits' },
    { id: 'chocolat', label: 'Chocolats', labelEn: 'Chocolates' },
    { id: 'the', label: 'Thé & Infusions', labelEn: 'Tea & Infusions' },
    { id: 'vegan', label: 'Vegan', labelEn: 'Vegan' },
];

export default function SweetsPage() {
    const { language } = useLanguage();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeTag, setActiveTag] = useState('all');
    const { scrollRef, onMouseDown, onMouseUp, onMouseMove } = useDragScroll();

    const filtered = activeTag === 'all'
        ? sweetProducts
        : sweetProducts.filter(p => p.tags?.includes(activeTag) || p.category?.toLowerCase().includes(activeTag));

    const pairings = [
        { coffee: language === 'fr' ? 'Espresso Intense' : 'Intense Espresso', sweet: language === 'fr' ? 'Spéculoos croustillant' : 'Crispy Speculoos', icon: '☕🍪' },
        { coffee: language === 'fr' ? 'Cappuccino Doux' : 'Smooth Cappuccino', sweet: language === 'fr' ? 'Macaron à la vanille' : 'Vanilla Macaron', icon: '☕🧁' },
        { coffee: language === 'fr' ? 'Lungo Corsé' : 'Bold Lungo', sweet: language === 'fr' ? 'Carré de chocolat noir' : 'Dark Chocolate Square', icon: '☕🍫' },
    ];

    return (
        <div className="w-full bg-[#FAF8F3] text-sb-black min-h-screen">
            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-[#3B1F0F] to-[#5C3317] pt-24 pb-40 px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(180,120,60,0.3),_transparent_60%)]" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <p className="text-amber-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                            {language === 'fr' ? 'Pour les fins Gourmets' : 'For the Discerning Palate'}
                        </p>
                        <h1 className="font-display text-6xl md:text-8xl xl:text-9xl uppercase text-white leading-[0.85] mb-8">
                            {language === 'fr' ? 'Gourman' : 'Sweet'}
                            <br />
                            <span className="text-amber-400">{language === 'fr' ? 'dises' : 'Treats'}</span>
                        </h1>
                        <p className="text-white/50 text-lg max-w-lg">
                            {language === 'fr'
                                ? "Biscuits, spéculoos, chocolats fins — les parfaits compagnons de votre moment café."
                                : "Biscuits, speculoos, fine chocolates — the perfect companions to your coffee moment."
                            }
                        </p>
                    </motion.div>
                </div>
                <div className="tornpaper-cream-down z-20" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#FAF8F3]" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 20%, 75% 0%, 50% 40%, 25% 0%, 0 20%)' }} />
                </div>
            </section>

            {/* ── Perfect Pairings ─────────────────────────────── */}
            <section className="py-16 px-8 bg-white border-b border-amber-50">
                <div className="max-w-[1400px] mx-auto">
                    <h2 className="text-center font-display text-4xl uppercase text-sb-black mb-12">
                        {language === 'fr' ? 'Accords Parfaits' : 'Perfect Pairings'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pairings.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                className="bg-[#FAF8F3] border border-amber-100 rounded-[24px] p-6 text-center"
                            >
                                <div className="text-4xl mb-4">{p.icon}</div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">{p.coffee}</p>
                                <p className="text-xs text-gray-500">{language === 'fr' ? '+ ' : '+ '}{p.sweet}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Filter + Grid ────────────────────────────────── */}
            <section className="py-16 px-8">
                <div className="max-w-[1400px] mx-auto">
                    <div
                        ref={scrollRef}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                        onMouseMove={onMouseMove}
                        className="flex overflow-x-auto no-scrollbar gap-3 mb-12 cursor-grab active:cursor-grabbing pb-4"
                    >
                        {SWEET_TAGS.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => setActiveTag(tag.id)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeTag === tag.id
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                                    : 'bg-white text-gray-400 border border-amber-100 hover:border-amber-600/30 hover:text-sb-black'
                                    }`}
                            >
                                {language === 'fr' ? tag.label : tag.labelEn}
                            </button>
                        ))}
                    </div>

                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filtered.map((product, i) => (
                                <ProductCard key={product.id} product={product} onClick={setSelectedProduct} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <p className="text-6xl mb-4">🍪</p>
                            <p className="font-bold text-xl mb-2">
                                {language === 'fr' ? 'Aucune gourmandise trouvée' : 'No treats found'}
                            </p>
                            <button onClick={() => setActiveTag('all')} className="text-amber-600 text-sm font-bold underline mt-2">
                                {language === 'fr' ? 'Voir tout' : 'View all'}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </div>
    );
}
