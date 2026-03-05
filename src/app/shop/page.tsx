"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Tag, X, Clock } from 'lucide-react';
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

export default function ShopPage() {
    const { t, language } = useLanguage();
    const tx = (fr: string, en: string) => language === 'fr' ? fr : en;
    const { recentlyViewed, addRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [bannerDismissed, setBannerDismissed] = useState(false);

    const { scrollRef, onMouseDown, onMouseUp, onMouseMove } = useDragScroll();

    // Admin-controlled sitewide discount banner — reads from AppConfig (backend-driven in production)
    const { sitewideDiscount } = AppConfig.promo;
    const showSitewidesBanner = sitewideDiscount.enabled && !bannerDismissed;

    const filteredProducts = useMemo(() => {
        let base = selectedCategory === 'all'
            ? enrichedProducts
            : enrichedProducts.filter(p => p.category === selectedCategory);
        return applyFilters(base, filters);
    }, [selectedCategory, filters]);

    const activeFilterCount =
        filters.categories.length + filters.tags.length +
        (filters.inStockOnly ? 1 : 0) +
        (filters.intensityRange[0] !== 1 || filters.intensityRange[1] !== 13 ? 1 : 0) +
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0);

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
                <section className="bg-sb-green pt-20 pb-32 px-8 relative text-white">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">{t('shopTitle')}</motion.h2>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-2xl mx-auto text-lg">{t('shopSubtitle')}</motion.p>
                    </div>
                    <div className="torn-paper-white-down z-20" />
                </section>

                <section className="bg-sb-white py-24 px-8">
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

                        {/* Category tabs */}
                        <div
                            ref={scrollRef}
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseUp}
                            onMouseMove={onMouseMove}
                            className="flex gap-3 overflow-x-auto whitespace-nowrap no-scrollbar pb-8 mb-12 border-b border-gray-100 items-center w-full cursor-grab active:cursor-grabbing"
                        >
                            {/* Filter button */}
                            <button
                                onClick={() => setFilterOpen(true)}
                                className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-sb-black text-white hover:bg-gray-800 transition-colors relative"
                            >
                                <SlidersHorizontal size={12} />
                                {t('filters') || 'Filtres'}
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-sb-green text-white text-[8px] font-black rounded-full flex items-center justify-center">{activeFilterCount}</span>
                                )}
                            </button>

                            {/* Category pills */}
                            {[
                                { id: 'all', label: t('allProducts') },
                                ...categoriesList.map(cat => ({ id: cat, label: cat }))
                            ].map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setSelectedCategory(id)}
                                    className={`flex-shrink-0 px-8 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${selectedCategory === id ? 'bg-sb-green text-white shadow-xl shadow-sb-green/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-sb-black border border-gray-100 hover:border-gray-200'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Results header */}
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="font-display text-3xl uppercase text-sb-black">{categoryLabel}</h3>
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
                                    onClick={() => { setFilters(DEFAULT_FILTERS); setSelectedCategory('all'); }}
                                    className="text-sb-green font-bold text-sm underline mt-2"
                                >
                                    {tx('Effacer les filtres', 'Clear filters')}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
