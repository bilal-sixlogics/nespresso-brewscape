"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Tag, X, Clock, ChevronDown, RotateCcw } from 'lucide-react';
import { enrichedProducts, categoriesList } from '@/lib/productsData';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailPanel } from '@/components/ui/ProductDetailPanel';
import { FilterDrawer, applyFilters, DEFAULT_FILTERS, FilterState } from '@/components/ui/FilterDrawer';
import { Product } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { ProductSkeleton } from '@/components/ui/ProductSkeleton';
import { useLanguage } from '@/context/LanguageContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { AppConfig } from '@/lib/config';
import { useDragScroll } from '@/hooks/useDragScroll';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popularity';


export default function ShopPage() {
    const { t, language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const { recentlyViewed, addRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [sortOpen, setSortOpen] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);

    const { scrollRef, onMouseDown, onMouseUp, onMouseMove } = useDragScroll();

    // Admin-controlled sitewide discount banner — reads from AppConfig (backend-driven in production)
    const { sitewideDiscount } = AppConfig.promo;
    const showSitewidesBanner = sitewideDiscount.enabled && !bannerDismissed;

    const filteredProducts = useMemo(() => {
        let base = selectedCategory === 'all'
            ? enrichedProducts
            : enrichedProducts.filter(p => p.category === selectedCategory);
        let result = applyFilters(base, filters);

        // Sort
        if (sortBy === 'price_asc') {
            result.sort((a, b) => (a.saleUnits?.[0]?.price ?? a.price) - (b.saleUnits?.[0]?.price ?? b.price));
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => (b.saleUnits?.[0]?.price ?? b.price) - (a.saleUnits?.[0]?.price ?? a.price));
        } else if (sortBy === 'newest') {
            result.sort((a, b) => (b.tags?.includes('Nouveau') ? 1 : 0) - (a.tags?.includes('Nouveau') ? 1 : 0));
        } else if (sortBy === 'popularity') {
            result.sort((a, b) => (b.tags?.includes('Best Seller') ? 1 : 0) - (a.tags?.includes('Best Seller') ? 1 : 0));
        }

        return result;
    }, [selectedCategory, filters, sortBy]);

    const activeFilterCount = filters.brands.length + filters.categories.length + filters.tags.length +
        (filters.inStockOnly ? 1 : 0) +
        (filters.intensityRange[0] !== 1 || filters.intensityRange[1] !== 13 ? 1 : 0) +
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0);

    const hasActiveFilters = activeFilterCount > 0 || sortBy !== 'relevance' || selectedCategory !== 'all';

    const resetAll = () => {
        setFilters(DEFAULT_FILTERS);
        setSortBy('relevance');
        setSelectedCategory('all');
    };

    const { displayedItems: displayedProducts, hasMore, isLoading, loadMore, reset } = usePagination(filteredProducts, 8);

    React.useEffect(() => { reset(); }, [selectedCategory, filters, reset]);

    const handleProductClick = (product: Product) => {
        addRecentlyViewed(product);
        setSelectedProduct(product);
    };

    const categoryLabel = selectedCategory === 'all' ? t('allProducts') : selectedCategory;

    return (
        <div className="w-full relative bg-sb-white text-sb-black overflow-x-hidden min-h-screen">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                {/* Hero Banner */}
                <section className="bg-sb-green pt-16 sm:pt-20 pb-20 sm:pb-28 md:pb-32 px-4 sm:px-6 lg:px-8 relative text-white">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">{t('shopTitle')}</motion.h2>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-2xl mx-auto text-lg">{t('shopSubtitle')}</motion.p>
                    </div>
                    <div className="torn-paper-white-down z-20" />
                </section>

                <section className="bg-sb-white py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-[1400px] mx-auto">

                        {/* ── Recently Viewed ── */}
                        {recentlyViewed.length > 0 && (
                            <div className="mb-12 pb-10 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {tx('Récemment consultés', 'Recently Viewed')}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={clearRecentlyViewed}
                                        className="text-[9px] font-bold uppercase tracking-widest text-gray-300 hover:text-red-400 transition-colors"
                                    >
                                        {tx('Effacer', 'Clear')}
                                    </button>
                                </div>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                    {recentlyViewed.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleProductClick(product)}
                                            className="flex-shrink-0 flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:border-sb-green hover:shadow-md transition-all group"
                                        >
                                            <img
                                                src={product.images?.[0] ?? product.image}
                                                alt={product.name}
                                                className="w-10 h-10 object-cover rounded-xl"
                                            />
                                            <div className="text-left">
                                                <p className="text-[10px] font-black uppercase tracking-wide text-sb-black group-hover:text-sb-green transition-colors line-clamp-1 max-w-28">
                                                    {product.name}
                                                </p>
                                                <p className="text-[10px] text-sb-green font-bold">€{product.price.toFixed(2)}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Controls & Category tabs */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12 border-b border-gray-100 pb-6">
                            {/* Filter and Sort Group - NO overflow-x-auto to ensure dropdown is visible */}
                            <div className="flex items-center gap-2 flex-shrink-0 z-50">
                                {/* Filter button */}
                                <button
                                    onClick={() => setFilterOpen(true)}
                                    className="flex items-center gap-2 px-3 sm:px-6 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-sb-black text-white hover:bg-gray-800 transition-colors relative"
                                >
                                    <SlidersHorizontal size={12} />
                                    <span className="hidden sm:inline">{t('filters') || 'Filtres'}</span>
                                    {activeFilterCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-sb-green text-white text-[8px] font-black rounded-full flex items-center justify-center">{activeFilterCount}</span>
                                    )}
                                </button>

                                {/* Sort Dropdown */}
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
                                                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-[90] overflow-hidden py-2"
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

                            {/* Divider */}
                            <div className="hidden md:block w-px h-6 bg-gray-200 flex-shrink-0 mx-2" />

                            {/* Category pills - Scrollable */}
                            <div
                                ref={scrollRef}
                                onMouseDown={onMouseDown}
                                onMouseUp={onMouseUp}
                                onMouseLeave={onMouseUp}
                                onMouseMove={onMouseMove}
                                className="flex gap-3 overflow-x-auto whitespace-nowrap no-scrollbar items-center w-full cursor-grab active:cursor-grabbing pb-2 md:pb-0"
                            >
                                {[
                                    { id: 'all', label: t('allProducts') },
                                    ...categoriesList.map(cat => ({ id: cat, label: cat }))
                                ].map(({ id, label }) => (
                                    <button
                                        key={id}
                                        onClick={() => setSelectedCategory(id)}
                                        className={`flex-shrink-0 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${selectedCategory === id ? 'bg-sb-green text-white shadow-xl shadow-sb-green/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-sb-black border border-gray-100 hover:border-gray-200'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results header */}
                        <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-12">
                            <h3 className="font-display text-xl sm:text-2xl md:text-3xl uppercase text-sb-black">{categoryLabel}</h3>
                            <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                                {filteredProducts.length} {t('results') || 'résultats'}
                            </div>
                        </div>

                        {/* Product grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-24">
                                <p className="text-6xl mb-4">🔍</p>
                                <p className="font-bold text-xl mb-2">{tx('Aucun produit trouvé', 'No products found')}</p>
                                <button
                                    onClick={resetAll}
                                    className="text-sb-green font-bold text-sm underline mt-2"
                                >
                                    {tx('Effacer les filtres', 'Clear filters')}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
                                {displayedProducts.map((product, idx) => (
                                    <ProductCard
                                        key={`${product.id}-${idx}`}
                                        product={product as Product}
                                        index={idx}
                                        onClick={handleProductClick}
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
                            totalCount={filteredProducts.length}
                            text={t('loadMore')}
                            noMoreText={t('noMoreItems')}
                        />
                    </div>
                </section>
            </motion.div>

            {/* Filter Drawer */}
            <FilterDrawer
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                onChange={setFilters}
                resultCount={filteredProducts.length}
            />

            {/* Product side panel */}
            <ProductDetailPanel
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}
