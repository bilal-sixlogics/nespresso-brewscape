"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, RotateCcw } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailPanel } from '@/components/ui/ProductDetailPanel';
import { FilterDrawer, DEFAULT_FILTERS, FilterState } from '@/components/ui/FilterDrawer';
import { Product, hasTag, getTagLabels } from '@/types';
import { useProducts, useCategories, useBrands } from '@/hooks/useProducts';
import { ProductQueryParams } from '@/lib/api/types';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { ProductSkeleton } from '@/components/ui/ProductSkeleton';
import { useLanguage } from '@/context/LanguageContext';
import { useDragScroll } from '@/hooks/useDragScroll';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popularity';

export default function AccessoriesPage() {
    const { language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [sortOpen, setSortOpen] = useState(false);
    const { scrollRef, onMouseDown, onMouseUp, onMouseMove } = useDragScroll();

    // Real categories/brands from backend
    const { categories: allCategories } = useCategories();
    const { brands } = useBrands();
    const accessoryCategories = useMemo(
        () => allCategories.filter(c => c.storefront_page === '/accessories' && c.status === 'active'),
        [allCategories]
    );

    // Single source of truth: active category name — driven by filters.categories
    const activeCategory = filters.categories[0] ?? '';

    const handleCategoryPill = (catName: string) => {
        setFilters(f => ({ ...f, categories: f.categories[0] === catName ? [] : [catName] }));
    };

    // Build API sort param
    const queryParams = useMemo<ProductQueryParams>(() => {
        const p: ProductQueryParams = { storefront_page: '/accessories', per_page: 12 };

        if (activeCategory) {
            const cat = accessoryCategories.find(c => c.name === activeCategory);
            if (cat) p.category = cat.slug;
        }
        if (sortBy === 'price_asc' || sortBy === 'price_desc' || sortBy === 'newest') {
            p.sort_by = sortBy;
        }
        if (filters.inStockOnly) p.in_stock = true;
        if (filters.brands.length > 0) {
            const b = brands.find(br => br.name === filters.brands[0]);
            if (b) p.brand = b.slug;
        }
        if (filters.priceRange[0] !== 0) p.min_price = filters.priceRange[0];
        if (filters.priceRange[1] !== 500) p.max_price = filters.priceRange[1];
        if (filters.tags.length > 0) p.tags = filters.tags.join(',');

        return p;
    }, [activeCategory, accessoryCategories, sortBy, filters, brands]);

    const { products: accessoryProducts, isLoading, hasMore, loadMore } = useProducts(queryParams);

    // Client-side sort for popularity only
    const displayProducts = useMemo(() => {
        if (sortBy !== 'popularity') return accessoryProducts;
        return [...accessoryProducts].sort((a, b) => (hasTag(b, 'best-seller') ? 1 : 0) - (hasTag(a, 'best-seller') ? 1 : 0));
    }, [accessoryProducts, sortBy]);

    const availableCategories = useMemo(() => accessoryCategories.map(c => c.name), [accessoryCategories]);
    const availableBrands = useMemo(() => brands.map(b => b.name), [brands]);
    const availableTags = useMemo(() => {
        const set = new Set<string>();
        accessoryProducts.forEach(p => getTagLabels(p).forEach(t => set.add(t)));
        return Array.from(set);
    }, [accessoryProducts]);

    const activeFilterCount = filters.brands.length + filters.categories.length + filters.tags.length +
        (filters.inStockOnly ? 1 : 0) +
        (filters.intensityRange[0] !== 1 || filters.intensityRange[1] !== 13 ? 1 : 0) +
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0);

    const hasActiveFilters = activeFilterCount > 0 || sortBy !== 'relevance';

    const resetAll = () => {
        setFilters(DEFAULT_FILTERS);
        setSortBy('relevance');
    };

    const perks = [
        { icon: '♻️', title: tx('Éco-conçus', 'Eco-designed'), desc: tx('Matériaux durables et responsables', 'Sustainable materials') },
        { icon: '🤝', title: tx('Compatible toutes marques', 'All-brand Compatible'), desc: tx('Fonctionne avec vos machines', 'Works with your machines') },
        { icon: '📦', title: tx('Vente par lot', 'Bulk Packs'), desc: tx("Économisez jusqu'à 30%", 'Save up to 30%') },
    ];

    return (
        <div className="w-full bg-sb-white text-sb-black min-h-screen">
            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-[#2A2A2A] to-[#1a1a1a] pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-28 md:pb-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(57,119,77,0.2),_transparent_60%)]" />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <p className="text-sb-green text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                            {tx('Complétez votre Setup', 'Complete Your Setup')}
                        </p>
                        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl xl:text-9xl uppercase text-white leading-[0.85] mb-6 sm:mb-8">
                            {tx('Accessoires', 'Accessories')}
                        </h1>
                        <p className="text-white/50 text-sm sm:text-base md:text-lg max-w-lg">
                            {tx(
                                "Gobelets, filtres, rangement — tout ce qu'il faut pour sublimer votre rituel café.",
                                "Cups, filters, storage — everything to elevate your coffee ritual."
                            )}
                        </p>
                    </motion.div>
                </div>
                <div className="torn-paper-white-down z-20" />
            </section>

            {/* ── Perks ────────────────────────────────────────── */}
            <section className="bg-white py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {perks.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6"
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

            {/* ── Products ─────────────────────────────────────── */}
            <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1400px] mx-auto">

                    {/* Controls bar */}
                    <div className="flex flex-col gap-3 mb-8 border-b border-gray-100 pb-6">
                        {/* Row 1: Filter + Sort + Reset (no overflow so dropdown is visible) */}
                        <div className="flex items-center gap-2 flex-shrink-0 z-50">
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
                            <div className="relative">
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

                            {/* Reset button */}
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
                        </div>

                        {/* Row 2: Real category pills from backend */}
                        <div
                            ref={scrollRef}
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseUp}
                            onMouseMove={onMouseMove}
                            className="flex gap-3 overflow-x-auto no-scrollbar items-center cursor-grab active:cursor-grabbing pb-1"
                        >
                            <button
                                onClick={() => setFilters(f => ({ ...f, categories: [] }))}
                                className={`flex-shrink-0 px-3 sm:px-5 md:px-6 py-2.5 sm:py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${!activeCategory
                                    ? 'bg-sb-green text-white shadow-lg shadow-sb-green/20'
                                    : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-sb-green/30 hover:text-sb-black'
                                    }`}
                            >
                                {tx('Tout', 'All')}
                            </button>
                            {accessoryCategories.map(cat => (
                                <button
                                    key={cat.slug}
                                    onClick={() => handleCategoryPill(cat.name)}
                                    className={`flex-shrink-0 px-3 sm:px-5 md:px-6 py-2.5 sm:py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeCategory === cat.name
                                        ? 'bg-sb-green text-white shadow-lg shadow-sb-green/20'
                                        : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-sb-green/30 hover:text-sb-black'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results header */}
                    <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
                        <h3 className="font-display text-xl sm:text-2xl md:text-3xl uppercase text-sb-black">
                            {!activeCategory ? tx('Tous les Accessoires', 'All Accessories') : activeCategory}
                        </h3>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                            {displayProducts.length} {tx('résultats', 'results')}
                        </div>
                    </div>

                    {/* Grid */}
                    {!isLoading && displayProducts.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-6xl mb-4">🧰</p>
                            <p className="font-bold text-xl mb-2">
                                {tx('Aucun accessoire trouvé', 'No accessories found')}
                            </p>
                            <button onClick={resetAll} className="text-sb-green font-bold text-sm underline mt-2">
                                {tx('Effacer les filtres', 'Clear filters')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
                            {displayProducts.map((product, idx) => (
                                <ProductCard
                                    key={`${product.id}-${idx}`}
                                    product={product}
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
                        totalCount={displayProducts.length}
                    />
                </div>
            </section>

            {/* Filter Drawer */}
            <FilterDrawer
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                onChange={setFilters}
                resultCount={displayProducts.length}
                availableCategories={availableCategories}
                availableBrands={availableBrands}
                availableTags={availableTags}
            />

            <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </div>
    );
}
