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

export default function SweetsPage() {
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
    const sweetCategories = useMemo(
        () => allCategories.filter(c => c.storefront_page === '/sweets' && c.status === 'active'),
        [allCategories]
    );

    // Single source of truth: active category name — driven by filters.categories
    const activeCategory = filters.categories[0] ?? '';

    // Pill click toggles category in filters (synced with FilterDrawer)
    const handleCategoryPill = (catName: string) => {
        setFilters(f => ({ ...f, categories: f.categories[0] === catName ? [] : [catName] }));
    };

    const queryParams = useMemo<ProductQueryParams>(() => {
        const p: ProductQueryParams = { storefront_page: '/sweets', per_page: 12 };

        if (activeCategory) {
            const cat = sweetCategories.find(c => c.name === activeCategory);
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
    }, [activeCategory, sweetCategories, sortBy, filters, brands]);

    const { products: sweetProducts, isLoading, hasMore, loadMore } = useProducts(queryParams);

    // Client-side sort for popularity (not supported by API)
    const displayProducts = useMemo(() => {
        if (sortBy !== 'popularity') return sweetProducts;
        return [...sweetProducts].sort((a, b) => (hasTag(b, 'best-seller') ? 1 : 0) - (hasTag(a, 'best-seller') ? 1 : 0));
    }, [sweetProducts, sortBy]);

    // Available filter options derived from fetched products
    const availableCategories = useMemo(() => sweetCategories.map(c => c.name), [sweetCategories]);
    const availableBrands = useMemo(() => brands.map(b => b.name), [brands]);
    const availableTags = useMemo(() => {
        const set = new Set<string>();
        sweetProducts.forEach(p => getTagLabels(p).forEach(t => set.add(t)));
        return Array.from(set);
    }, [sweetProducts]);

    const activeFilterCount = filters.brands.length + filters.categories.length + filters.tags.length +
        (filters.inStockOnly ? 1 : 0) +
        (filters.intensityRange[0] !== 1 || filters.intensityRange[1] !== 13 ? 1 : 0) +
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0);

    const hasActiveFilters = activeFilterCount > 0 || sortBy !== 'relevance';

    const resetAll = () => {
        setFilters(DEFAULT_FILTERS);
        setSortBy('relevance');
    };

    const pairings = [
        { coffee: tx('Espresso Intense', 'Intense Espresso'), sweet: tx('Spéculoos croustillant', 'Crispy Speculoos'), icon: '☕🍪' },
        { coffee: tx('Cappuccino Doux', 'Smooth Cappuccino'), sweet: tx('Macaron à la vanille', 'Vanilla Macaron'), icon: '☕🧁' },
        { coffee: tx('Lungo Corsé', 'Bold Lungo'), sweet: tx('Carré de chocolat noir', 'Dark Chocolate Square'), icon: '☕🍫' },
    ];

    return (
        <div className="w-full bg-[#FAF8F3] text-sb-black min-h-screen">
            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-[#3B1F0F] to-[#5C3317] pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-28 md:pb-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(180,120,60,0.3),_transparent_60%)]" />
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-48 sm:h-48 md:w-80 md:h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <p className="text-amber-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                            {tx('Pour les fins Gourmets', 'For the Discerning Palate')}
                        </p>
                        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl xl:text-9xl uppercase text-white leading-[0.85] mb-6 sm:mb-8">
                            {tx('Gourman', 'Sweet')}
                            <br />
                            <span className="text-amber-400">{tx('dises', 'Treats')}</span>
                        </h1>
                        <p className="text-white/50 text-sm sm:text-base md:text-lg max-w-lg">
                            {tx(
                                "Biscuits, spéculoos, chocolats fins — les parfaits compagnons de votre moment café.",
                                "Biscuits, speculoos, fine chocolates — the perfect companions to your coffee moment."
                            )}
                        </p>
                    </motion.div>
                </div>
                <div className="torn-paper-cream-down z-20" />
            </section>

            {/* ── Perfect Pairings ─────────────────────────────── */}
            <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-amber-50">
                <div className="max-w-[1400px] mx-auto">
                    <h2 className="text-center font-display text-2xl sm:text-3xl md:text-4xl uppercase text-sb-black mb-8 sm:mb-10 md:mb-12">
                        {tx('Accords Parfaits', 'Perfect Pairings')}
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
                                <p className="text-xs text-gray-500">+ {p.sweet}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Products ─────────────────────────────────────── */}
            <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1400px] mx-auto">

                    {/* Controls bar */}
                    <div className="flex flex-col gap-3 mb-8 border-b border-amber-100 pb-6">
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
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            {/* Sort dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setSortOpen(!sortOpen)}
                                    className="flex items-center gap-2 px-3 sm:px-6 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-50 text-amber-700 border border-amber-100 hover:border-amber-300 transition-colors"
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
                                                className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-amber-100 z-[90] overflow-hidden py-2"
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
                                                        className={`block w-full text-left px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors ${sortBy === opt.id ? 'bg-amber-50 text-amber-600' : 'text-gray-500 hover:bg-amber-50 hover:text-sb-black'}`}
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
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                                    : 'bg-amber-50 text-amber-700 border border-amber-100 hover:border-amber-600/30 hover:text-sb-black'
                                    }`}
                            >
                                {tx('Tout', 'All')}
                            </button>
                            {sweetCategories.map(cat => (
                                <button
                                    key={cat.slug}
                                    onClick={() => handleCategoryPill(cat.name)}
                                    className={`flex-shrink-0 px-3 sm:px-5 md:px-6 py-2.5 sm:py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeCategory === cat.name
                                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                                        : 'bg-amber-50 text-amber-700 border border-amber-100 hover:border-amber-600/30 hover:text-sb-black'
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
                            {activeCategory === 'all' ? tx('Toutes les Gourmandises', 'All Treats') : activeCategory}
                        </h3>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                            {displayProducts.length} {tx('résultats', 'results')}
                        </div>
                    </div>

                    {/* Grid */}
                    {!isLoading && displayProducts.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-6xl mb-4">🍪</p>
                            <p className="font-bold text-xl mb-2">
                                {tx('Aucune gourmandise trouvée', 'No treats found')}
                            </p>
                            <button onClick={resetAll} className="text-amber-600 font-bold text-sm underline mt-2">
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
