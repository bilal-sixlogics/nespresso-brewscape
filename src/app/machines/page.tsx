"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, RotateCcw, Settings, Zap, Droplets, Coffee } from 'lucide-react';
import { enrichedProducts } from '@/lib/productsData';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailPanel } from '@/components/ui/ProductDetailPanel';
import { FilterDrawer, applyFilters, DEFAULT_FILTERS, FilterState } from '@/components/ui/FilterDrawer';
import { Product } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { ProductSkeleton } from '@/components/ui/ProductSkeleton';
import { useLanguage } from '@/context/LanguageContext';
import { useDragScroll } from '@/hooks/useDragScroll';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popularity';

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
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [sortOpen, setSortOpen] = useState(false);
    const { scrollRef, onMouseDown, onMouseUp, onMouseMove } = useDragScroll();

    const filteredMachines = useMemo(() => {
        let base = activeCategory === 'all'
            ? machineProducts
            : machineProducts.filter(p => {
                const features = p.features?.flatMap(f => [...f.items, ...(f.itemsEn ?? [])]).join(' ').toLowerCase() ?? '';
                return features.includes(activeCategory) || (p.tags ?? []).includes(activeCategory);
            });

        let result = applyFilters(base, filters);

        if (sortBy === 'price_asc') result.sort((a, b) => (a.saleUnits?.[0]?.price ?? a.price) - (b.saleUnits?.[0]?.price ?? b.price));
        else if (sortBy === 'price_desc') result.sort((a, b) => (b.saleUnits?.[0]?.price ?? b.price) - (a.saleUnits?.[0]?.price ?? a.price));
        else if (sortBy === 'newest') result.sort((a, b) => (b.tags?.includes('Nouveau') ? 1 : 0) - (a.tags?.includes('Nouveau') ? 1 : 0));
        else if (sortBy === 'popularity') result.sort((a, b) => (b.tags?.includes('Best Seller') ? 1 : 0) - (a.tags?.includes('Best Seller') ? 1 : 0));

        return result;
    }, [activeCategory, filters, sortBy]);

    const activeFilterCount = filters.brands.length + filters.categories.length + filters.tags.length +
        (filters.inStockOnly ? 1 : 0) +
        (filters.intensityRange[0] !== 1 || filters.intensityRange[1] !== 13 ? 1 : 0) +
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0);

    const hasActiveFilters = activeFilterCount > 0 || sortBy !== 'relevance' || activeCategory !== 'all';

    const resetAll = () => {
        setFilters(DEFAULT_FILTERS);
        setSortBy('relevance');
        setActiveCategory('all');
    };

    const { displayedItems, hasMore, isLoading, loadMore, reset } = usePagination(filteredMachines, 8);

    React.useEffect(() => { reset(); }, [activeCategory, filters, sortBy, reset]);

    const highlights = [
        { icon: '⚡', label: tx('Pression 15 bars', '15 Bar Pressure'), desc: tx('Extraction professionnelle', 'Professional extraction') },
        { icon: '🫘', label: tx('Mouture intégrée', 'Built-in Grinder'), desc: tx('Grains fraîchement moulus', 'Freshly ground beans') },
        { icon: '🌡️', label: tx('Contrôle thermique', 'Thermal Control'), desc: tx('Température optimale', 'Optimal temperature') },
        { icon: '🧹', label: tx('Nettoyage auto', 'Auto-Clean'), desc: tx('Entretien facile', 'Easy maintenance') },
    ];

    return (
        <div className="w-full bg-sb-white text-sb-black min-h-screen">
            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="bg-sb-black pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-28 md:pb-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sb-green/20 via-transparent to-[#1a1a1a]" />
                <div className="absolute top-10 sm:top-20 right-0 sm:right-20 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-sb-green/10 rounded-full blur-3xl" />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                            {tx('Équipement Premium', 'Premium Equipment')}
                        </p>
                        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl xl:text-9xl uppercase text-white leading-[0.85] mb-6 sm:mb-8">
                            {tx('Machines', 'Machines')}
                            <br />
                            <span className="text-sb-green">à Café</span>
                        </h1>
                        <p className="text-white/50 text-sm sm:text-base md:text-lg max-w-lg">
                            {tx(
                                "Du barista débutant au professionnel exigeant — trouvez la machine qui correspond à votre passion.",
                                "From beginner barista to demanding professional — find the machine that matches your passion."
                            )}
                        </p>
                    </motion.div>
                </div>
                <div className="torn-paper-white-down z-20" />
            </section>

            {/* ── Highlights ───────────────────────────────────── */}
            <section className="bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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

            {/* ── Products ─────────────────────────────────────── */}
            <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-sb-white">
                <div className="max-w-[1400px] mx-auto">

                    {/* Controls bar */}
                    <div
                        ref={scrollRef}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                        onMouseMove={onMouseMove}
                        className="flex gap-3 overflow-x-auto no-scrollbar pb-8 mb-8 border-b border-gray-100 items-center cursor-grab active:cursor-grabbing"
                    >
                        {/* Filter button */}
                        <button
                            onClick={() => setFilterOpen(true)}
                            className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-6 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-sb-black text-white hover:bg-gray-800 transition-colors relative"
                        >
                            <SlidersHorizontal size={12} />
                            <span className="hidden sm:inline">{tx('Filtres', 'Filters')}</span>
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-sb-green text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Sort dropdown */}
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setSortOpen(!sortOpen)}
                                className="flex items-center gap-2 px-3 sm:px-6 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-gray-50 text-gray-600 border border-gray-100 hover:border-gray-300 transition-colors"
                            >
                                {sortBy === 'relevance' && tx('Pertinence', 'Relevance')}
                                {sortBy === 'price_asc' && tx('Prix: Croissant', 'Price: Low to High')}
                                {sortBy === 'price_desc' && tx('Prix: Décroissant', 'Price: High to Low')}
                                {sortBy === 'newest' && tx('Nouveautés', 'Newest')}
                                {sortBy === 'popularity' && tx('Popularité', 'Popularity')}
                                <ChevronDown size={12} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {sortOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[80]" onClick={() => setSortOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-[90] overflow-hidden py-2"
                                        >
                                            {[
                                                { id: 'relevance', lbl: tx('Pertinence', 'Relevance') },
                                                { id: 'price_asc', lbl: tx('Prix: Croissant', 'Price: Low to High') },
                                                { id: 'price_desc', lbl: tx('Prix: Décroissant', 'Price: High to Low') },
                                                { id: 'newest', lbl: tx('Nouveautés', 'Newest') },
                                                { id: 'popularity', lbl: tx('Popularité', 'Popularity') },
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => { setSortBy(opt.id as SortOption); setSortOpen(false); }}
                                                    className={`block w-full text-left px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors ${sortBy === opt.id ? 'bg-gray-50 text-sb-green' : 'text-gray-500 hover:bg-gray-50 hover:text-sb-black'}`}
                                                >
                                                    {opt.lbl}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Reset button — visible when filters/sort/category are non-default */}
                        <AnimatePresence>
                            {hasActiveFilters && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    onClick={resetAll}
                                    className="flex-shrink-0 flex items-center gap-2 px-5 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
                                >
                                    <RotateCcw size={11} />
                                    {tx('Réinitialiser', 'Reset')}
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-200 flex-shrink-0 mx-1" />

                        {/* Category tabs */}
                        {MACHINE_CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            const label = language === 'fr' ? cat.label : cat.labelEn;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-5 md:px-6 py-2.5 sm:py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${activeCategory === cat.id
                                        ? 'bg-sb-green text-white shadow-xl shadow-sb-green/25'
                                        : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-sb-green/30 hover:text-sb-black'
                                        }`}
                                >
                                    <Icon size={12} />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Results header */}
                    <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
                        <h3 className="font-display text-xl sm:text-2xl md:text-3xl uppercase text-sb-black">
                            {activeCategory === 'all'
                                ? tx('Toutes les Machines', 'All Machines')
                                : MACHINE_CATEGORIES.find(c => c.id === activeCategory)?.[language === 'fr' ? 'label' : 'labelEn'] ?? activeCategory
                            }
                        </h3>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                            {filteredMachines.length} {tx('résultats', 'results')}
                        </div>
                    </div>

                    {/* Grid */}
                    {filteredMachines.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-6xl mb-4">☕</p>
                            <p className="font-bold text-xl mb-2">
                                {tx('Aucune machine trouvée', 'No machines found')}
                            </p>
                            <button onClick={resetAll} className="text-sb-green font-bold text-sm underline mt-2">
                                {tx('Effacer les filtres', 'Clear filters')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                            {displayedItems.map((product, idx) => (
                                <ProductCard
                                    key={`${product.id}-${idx}`}
                                    product={product as Product}
                                    index={idx}
                                    onClick={setSelectedProduct}
                                />
                            ))}
                            {isLoading && [...Array(4)].map((_, i) => (
                                <ProductSkeleton key={`skeleton-${i}`} />
                            ))}
                        </div>
                    )}

                    <LoadMoreButton
                        isLoading={isLoading}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        totalCount={filteredMachines.length}
                    />
                </div>
            </section>

            {/* Filter Drawer */}
            <FilterDrawer
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                onChange={setFilters}
                resultCount={filteredMachines.length}
            />

            {/* Side Panel */}
            <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </div>
    );
}
