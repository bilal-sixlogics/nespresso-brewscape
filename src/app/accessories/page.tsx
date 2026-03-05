"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { enrichedProducts } from '@/lib/productsData';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailPanel } from '@/components/ui/ProductDetailPanel';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

import { useDragScroll } from '@/hooks/useDragScroll';

const accessoryProducts = enrichedProducts.filter(p =>
    p.category === "Accessoires"
);

const TAGS = [
    { id: 'all', label: 'Tous les Accessoires', labelEn: 'All Accessories' },
    { id: 'eco-friendly', label: 'Éco-responsable', labelEn: 'Eco-friendly' },
    { id: 'cups', label: 'Gobelets & Tasses', labelEn: 'Cups & Glasses' },
    { id: 'filters', label: 'Filtres', labelEn: 'Filters' },
    { id: 'storage', label: 'Rangement', labelEn: 'Storage' },
];

export default function AccessoriesPage() {
    const { language } = useLanguage();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeTag, setActiveTag] = useState('all');
    const { scrollRef, onMouseDown, onMouseUp, onMouseMove } = useDragScroll();

    const filtered = activeTag === 'all'
        ? accessoryProducts
        : accessoryProducts.filter(p => p.tags?.includes(activeTag));

    const perks = [
        { icon: '♻️', title: language === 'fr' ? 'Éco-conçus' : 'Eco-designed', desc: language === 'fr' ? 'Matériaux durables et responsables' : 'Sustainable materials' },
        { icon: '🤝', title: language === 'fr' ? 'Compatible toutes marques' : 'All-brand Compatible', desc: language === 'fr' ? 'Fonctionne avec vos machines' : 'Works with your machines' },
        { icon: '📦', title: language === 'fr' ? 'Vente par lot' : 'Bulk Packs', desc: language === 'fr' ? 'Économisez jusqu\'à 30%' : 'Save up to 30%' },
    ];

    return (
        <div className="w-full bg-sb-white text-sb-black min-h-screen">
            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-[#2A2A2A] to-[#1a1a1a] pt-24 pb-40 px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(57,119,77,0.2),_transparent_60%)]" />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                            {language === 'fr' ? 'Complétez votre Setup' : 'Complete Your Setup'}
                        </p>
                        <h1 className="font-display text-6xl md:text-8xl xl:text-9xl uppercase text-white leading-[0.85] mb-8">
                            {language === 'fr' ? 'Accessoires' : 'Accessories'}
                        </h1>
                        <p className="text-white/50 text-lg max-w-lg">
                            {language === 'fr'
                                ? "Gobelets, filtres, rangement — tout ce qu'il faut pour sublimer votre rituel café."
                                : "Cups, filters, storage — everything to elevate your coffee ritual."
                            }
                        </p>
                    </motion.div>
                </div>
                <div className="torn-paper-white-down z-20" />
            </section>

            {/* ── Perks ────────────────────────────────────────── */}
            <section className="bg-white py-12 px-8 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {perks.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-4 p-6"
                        >
                            <span className="text-3xl">{p.icon}</span>
                            <div>
                                <p className="font-bold text-sm text-sb-black mb-1">{p.title}</p>
                                <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
                            </div>
                        </motion.div>
                    ))}
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
                        {TAGS.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => setActiveTag(tag.id)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeTag === tag.id
                                    ? 'bg-sb-green text-white shadow-lg shadow-sb-green/20'
                                    : 'bg-white text-gray-400 border border-gray-100 hover:border-sb-green/30 hover:text-sb-black'
                                    }`}
                            >
                                {language === 'fr' ? tag.label : tag.labelEn}
                            </button>
                        ))}
                    </div>


                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {filtered.map((product, i) => (
                                <ProductCard key={product.id} product={product} onClick={setSelectedProduct} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <p className="text-6xl mb-4">🧰</p>
                            <p className="font-bold text-xl mb-2">
                                {language === 'fr' ? 'Aucun accessoire trouvé' : 'No accessories found'}
                            </p>
                            <button onClick={() => setActiveTag('all')} className="text-sb-green text-sm font-bold underline mt-2">
                                {language === 'fr' ? 'Voir tous les accessoires' : 'View all accessories'}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </div>
    );
}
