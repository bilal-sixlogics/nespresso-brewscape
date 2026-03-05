"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { enrichedProducts } from '@/lib/productsData';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailPanel } from '@/components/ui/ProductDetailPanel';
import { MobileCarousel } from '@/components/ui/MobileCarousel';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Settings, Zap, Droplets, Coffee } from 'lucide-react';

import { useDragScroll } from '@/hooks/useDragScroll';

const MACHINE_CATEGORIES = [
    { id: 'all', label: 'Toutes les Machines', labelEn: 'All Machines', icon: Coffee },
    { id: 'automatique', label: 'Super-Automatiques', labelEn: 'Super-Automatic', icon: Zap },
    { id: 'manuelle', label: 'Manuelles & Semi-Auto', labelEn: 'Manual & Semi-Auto', icon: Settings },
    { id: 'capsule', label: 'À Capsules', labelEn: 'Capsule Machines', icon: Droplets },
];

const machineProducts = enrichedProducts.filter(p =>
    p.category === "Machines à Café" || p.category === "Vending"
);

export default function MachinesPage() {
    const { t, language } = useLanguage();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const { scrollRef, onMouseDown, onMouseUp, onMouseMove } = useDragScroll();

    const filteredMachines = activeCategory === 'all'
        ? machineProducts
        : machineProducts.filter(p => {
            const cat = activeCategory;
            const features = p.features?.flatMap(f => [...f.items, ...(f.itemsEn ?? [])]).join(' ').toLowerCase() ?? '';
            return features.includes(cat) || (p.tags ?? []).includes(cat);
        });

    const highlights = [
        { icon: '⚡', label: language === 'fr' ? 'Pression 15 bars' : '15 Bar Pressure', desc: language === 'fr' ? 'Extraction professionnelle' : 'Professional extraction' },
        { icon: '🫘', label: language === 'fr' ? 'Mouture intégrée' : 'Built-in Grinder', desc: language === 'fr' ? 'Grains fraîchement moulus' : 'Freshly ground beans' },
        { icon: '🌡️', label: language === 'fr' ? 'Contrôle thermique' : 'Thermal Control', desc: language === 'fr' ? 'Température optimale' : 'Optimal temperature' },
        { icon: '🧹', label: language === 'fr' ? 'Nettoyage auto' : 'Auto-Clean', desc: language === 'fr' ? 'Entretien facile' : 'Easy maintenance' },
    ];

    return (
        <div className="w-full bg-sb-white text-sb-black min-h-screen">
            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="bg-sb-black pt-24 pb-40 px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sb-green/20 via-transparent to-[#1a1a1a]" />
                <div className="absolute top-20 right-20 w-96 h-96 bg-sb-green/10 rounded-full blur-3xl" />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                            {language === 'fr' ? 'Équipement Premium' : 'Premium Equipment'}
                        </p>
                        <h1 className="font-display text-6xl md:text-8xl xl:text-9xl uppercase text-white leading-[0.85] mb-8">
                            {language === 'fr' ? 'Machines' : 'Machines'}
                            <br />
                            <span className="text-sb-green">à Café</span>
                        </h1>
                        <p className="text-white/50 text-lg max-w-lg">
                            {language === 'fr'
                                ? "Du barista débutant au professionnel exigeant — trouvez la machine qui correspond à votre passion."
                                : "From beginner barista to demanding professional — find the machine that matches your passion."
                            }
                        </p>
                    </motion.div>
                </div>
                <div className="torn-paper-white-down z-20" />
            </section>

            {/* ── Highlights ───────────────────────────────────── */}
            <section className="bg-white py-16 px-8 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {highlights.map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center p-6"
                        >
                            <div className="text-4xl mb-3">{h.icon}</div>
                            <p className="font-bold text-sm text-sb-black mb-1">{h.label}</p>
                            <p className="text-xs text-gray-400">{h.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Category Filter ──────────────────────────────── */}
            <section className="bg-sb-white py-12 px-8">
                <div className="max-w-[1400px] mx-auto">
                    <div
                        ref={scrollRef}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                        onMouseMove={onMouseMove}
                        className="flex overflow-x-auto no-scrollbar gap-3 justify-start md:justify-center mb-16 cursor-grab active:cursor-grabbing pb-4"
                    >
                        {MACHINE_CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            const label = language === 'fr' ? cat.label : cat.labelEn;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${activeCategory === cat.id
                                        ? 'bg-sb-green text-white shadow-xl shadow-sb-green/25'
                                        : 'bg-white text-gray-400 border border-gray-100 hover:border-sb-green/30 hover:text-sb-black'
                                        }`}
                                >
                                    <Icon size={12} />
                                    {label}
                                </button>
                            );
                        })}
                    </div>


                    {/* Product Grid */}
                    {filteredMachines.length > 0 ? (
                        <MobileCarousel>
                            {filteredMachines.map((product, i) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={setSelectedProduct}
                                    index={i}
                                />
                            ))}
                        </MobileCarousel>
                    ) : (
                        <div className="text-center py-24">
                            <p className="text-6xl mb-4">☕</p>
                            <p className="text-sb-black font-bold text-xl mb-2">
                                {language === 'fr' ? 'Aucune machine trouvée' : 'No machines found'}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {language === 'fr' ? 'Essayez une autre catégorie' : 'Try another category'}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Side Panel ───────────────────────────────────── */}
            <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </div>
    );
}
