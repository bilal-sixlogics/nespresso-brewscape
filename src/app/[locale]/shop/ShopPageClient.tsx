"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Clock, ChevronDown, RotateCcw } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailPanel } from '@/components/ui/ProductDetailPanel';
import { FilterDrawer, DEFAULT_FILTERS, FilterState } from '@/components/ui/FilterDrawer';
import { CupSeparator } from '@/components/ui/CupSeparator';
import { Product, getProductImage, getDisplayPrice } from '@/types';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { ProductSkeleton } from '@/components/ui/ProductSkeleton';
import { useLanguage } from '@/context/LanguageContext';
import { useFormatPrice } from '@/context/SiteSettingsContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useProducts, useCategories, useBrands } from '@/hooks/useProducts';
import { ProductQueryParams, PaginationMeta } from '@/lib/api/types';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

export interface ShopPageClientProps {
    /** ?category= slug, resolved on the server. */
    initialCategory?: string;
    /** ?brand= slug, resolved on the server. */
    initialBrand?: string;
    /** First page of results, fetched server-side for the same params. */
    initialProducts?: { products: Product[]; meta: PaginationMeta | null } | null;
}

function ShopPageContent({ initialCategory, initialBrand, initialProducts }: ShopPageClientProps) {
    const { t } = useLanguage();
    const formatPrice = useFormatPrice();
    const { recentlyViewed, addRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [sortOpen, setSortOpen] = useState(false);

    const { scrollRef, onMouseDown, onMouseUp, onMouseMove } = useDragScroll();

    // Fetch categories and brands for filter options
    const { categories: allCategories } = useCategories();
    const { brands } = useBrands();

    // Only show /shop categories
    const categories = useMemo(
        () => allCategories.filter(c => c.storefront_page === '/shop' && c.status === 'active'),
        [allCategories]
    );

    // ?category= / ?brand= are read on the SERVER and arrive as slugs. Reading
    // them here with useSearchParams() forced this whole subtree to render
    // client-side, so crawlers received an empty <main>. Resolving slug -> name
    // still has to happen once the category/brand lists load.
    const appliedFromUrl = useRef(false);
    useEffect(() => {
        if (appliedFromUrl.current) return;
        if (!initialCategory && !initialBrand) { appliedFromUrl.current = true; return; }

        const catMatch = initialCategory ? categories.find(c => c.slug === initialCategory) : null;
        const brandMatch = initialBrand ? brands.find(b => b.slug === initialBrand) : null;
        if ((initialCategory && !catMatch) || (initialBrand && !brandMatch)) return; // wait for data

        setFilters(f => ({
            ...f,
            categories: catMatch ? [catMatch.name] : f.categories,
            brands: brandMatch ? [brandMatch.name] : f.brands,
        }));
        appliedFromUrl.current = true;
    }, [initialCategory, initialBrand, categories, brands]);

    // Single source of truth: active category name ('' = all)
    // Category pill and FilterDrawer both read/write this via `filters.categories`
    const activeCategory = filters.categories[0] ?? '';

    // Pill click: set or toggle the category in filters
    const handleCategoryPill = (catName: string) => {
        setFilters(f => ({
            ...f,
            categories: f.categories[0] === catName ? [] : [catName],
        }));
    };

    // Build API query params — single unified source
    const queryParams = useMemo<ProductQueryParams>(() => {
        const params: ProductQueryParams = { per_page: 20, storefront_page: '/shop' };

        // Category — from filters (pill and drawer are synced)
        if (activeCategory) {
            const catObj = categories.find(c => c.name === activeCategory);
            if (catObj) params.category = catObj.slug;
        }

        // Brand
        if (filters.brands.length > 0) {
            const brandObj = brands.find(b => b.name === filters.brands[0]);
            if (brandObj) params.brand = brandObj.slug;
        }

        if (filters.inStockOnly) params.in_stock = true;
        if (filters.intensityRange[0] !== 1) params.intensity_min = filters.intensityRange[0];
        if (filters.intensityRange[1] !== 13) params.intensity_max = filters.intensityRange[1];
        if (filters.priceRange[0] !== 0) params.min_price = filters.priceRange[0];
        if (filters.priceRange[1] !== 500) params.max_price = filters.priceRange[1];
        if (filters.tags.length > 0) params.tags = filters.tags.join(',');
        if (sortBy !== 'relevance') params.sort_by = sortBy;

        return params;
    }, [filters, sortBy, categories, brands, activeCategory]);

    // Fetch products from backend, seeded with what the server already rendered
    // so the first paint needs no round-trip and the HTML carries real products.
    const { products, meta, isLoading, loadMore, hasMore } = useProducts(
        queryParams,
        initialProducts,
    );

    const activeFilterCount =
        filters.brands.length + filters.categories.length + filters.tags.length +
        (filters.inStockOnly ? 1 : 0) +
        (filters.intensityRange[0] !== 1 || filters.intensityRange[1] !== 13 ? 1 : 0) +
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0);

    const hasActiveFilters = activeFilterCount > 0 || sortBy !== 'relevance';

    const resetAll = () => {
        setFilters(DEFAULT_FILTERS);
        setSortBy('relevance');
    };

    const handleProductClick = (product: Product) => {
        addRecentlyViewed(product);
        setSelectedProduct(product);
    };

    // Filter options derived from fetched data
    const availableCategories = useMemo(() => categories.map(c => c.name), [categories]);
    const availableBrands = useMemo(() => brands.map(b => b.name), [brands]);
    const availableTags = useMemo(() => {
        const tagSet = new Set<string>();
        products.forEach(p => p.tags?.forEach(tag => tagSet.add(tag.label)));
        return Array.from(tagSet);
    }, [products]);

    // Category pills: top-level /shop categories sorted
    const categoryPills = useMemo(() =>
        categories.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order),
        [categories]
    );

    const categoryLabel = activeCategory || t('allProducts');
    const totalCount = meta?.total ?? products.length;

    return (
        <div className="w-full relative bg-ink text-sand overflow-x-hidden min-h-screen grain-overlay">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                {/* Hero Banner */}
                <section className="bg-ink grain-overlay pt-16 sm:pt-20 pb-14 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 relative text-sand">
                    <div className="max-w-[1400px] mx-auto text-center">
                        {/* h1, not h2: this is the page's primary heading and /shop
                            previously had no h1 at all. Same text, same classes —
                            the rendered appearance is identical. */}
                        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">{t('shopTitle')}</motion.h1>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-sand/60 max-w-2xl mx-auto text-lg">{t('shopSubtitle')}</motion.p>
                        <div className="max-w-xs mx-auto mt-10">
                            <CupSeparator tone="gold" />
                        </div>
                    </div>
                </section>

                <section className="bg-ink py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-[1400px] mx-auto">

                        {/* ── Recently Viewed ── */}
                        {recentlyViewed.length > 0 && (
                            <div className="mb-12 pb-10 border-b border-sand/10">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-cocoa" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-cocoa">
                                            {t('recentlyViewed')}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={clearRecentlyViewed}
                                        className="text-[9px] font-bold uppercase tracking-widest text-cocoa/50 hover:text-red-400 transition-colors"
                                    >
                                        {t('clear')}
                                    </button>
                                </div>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                    {recentlyViewed.map((product) => {
                                        const img = getProductImage(product as Product);
                                        const price = getDisplayPrice(product as Product);
                                        return (
                                            <button
                                                key={product.id}
                                                onClick={() => handleProductClick(product as Product)}
                                                className="flex-shrink-0 flex items-center gap-3 bg-sand/8 border border-sand/10 rounded-2xl px-4 py-3 hover:border-gold hover:shadow-md hover:shadow-gold/10 transition-all group"
                                            >
                                                {img && (
                                                    <img
                                                        src={img}
                                                        alt={product.name}
                                                        className="w-10 h-10 object-cover rounded-xl"
                                                    />
                                                )}
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-wide text-sand group-hover:text-gold transition-colors line-clamp-1 max-w-28">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-[10px] text-gold font-bold">{formatPrice(price)}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Controls & Category tabs */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12 border-b border-sand/10 pb-6">
                            {/* Filter and Sort Group */}
                            <div className="flex items-center gap-2 flex-shrink-0 z-50">
                                {/* Filter button */}
                                <button
                                    onClick={() => setFilterOpen(true)}
                                    className="flex items-center gap-2 px-3 sm:px-6 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-gold text-ink hover:bg-[#b8914d] transition-colors relative"
                                >
                                    <SlidersHorizontal size={12} />
                                    <span className="hidden sm:inline">{t('filters')}</span>
                                    {activeFilterCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ink text-gold border border-gold/50 text-[8px] font-black rounded-full flex items-center justify-center">{activeFilterCount}</span>
                                    )}
                                </button>

                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setSortOpen(!sortOpen)}
                                        className="flex items-center gap-2 px-3 sm:px-6 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-sand/8 text-sand/70 border border-sand/10 hover:border-sand/25 transition-colors"
                                    >
                                        {sortBy === 'relevance' && t('sortRelevance')}
                                        {sortBy === 'price_asc' && t('sortPriceLow')}
                                        {sortBy === 'price_desc' && t('sortPriceHigh')}
                                        {sortBy === 'newest' && t('sortNewest')}
                                        <ChevronDown size={12} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {sortOpen && (
                                            <>
                                                <div className="fixed inset-0 z-[80]" onClick={() => setSortOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full left-0 mt-2 w-48 bg-sand rounded-2xl shadow-xl border border-ink/10 z-[90] overflow-hidden py-2"
                                                >
                                                    {[
                                                        { id: 'relevance', lbl: t('sortRelevance') },
                                                        { id: 'price_asc', lbl: t('sortPriceLow') },
                                                        { id: 'price_desc', lbl: t('sortPriceHigh') },
                                                        { id: 'newest', lbl: t('sortNewest') },
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => { setSortBy(opt.id as SortOption); setSortOpen(false); }}
                                                            className={`block w-full text-left px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors ${sortBy === opt.id ? 'bg-ink/5 text-gold' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'}`}
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
                                        className="flex-shrink-0 flex items-center gap-2 px-5 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-colors"
                                    >
                                        <RotateCcw size={11} />
                                        {t('reset')}
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {/* Divider */}
                            <div className="hidden md:block w-px h-6 bg-sand/15 flex-shrink-0 mx-2" />

                            {/* Category pills — synced with FilterDrawer */}
                            <div
                                ref={scrollRef}
                                onMouseDown={onMouseDown}
                                onMouseUp={onMouseUp}
                                onMouseLeave={onMouseUp}
                                onMouseMove={onMouseMove}
                                className="flex gap-3 overflow-x-auto whitespace-nowrap no-scrollbar items-center w-full cursor-grab active:cursor-grabbing pb-2 md:pb-0"
                            >
                                {/* All pill */}
                                <button
                                    onClick={() => setFilters(f => ({ ...f, categories: [] }))}
                                    className={`flex-shrink-0 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${!activeCategory ? 'bg-gold text-ink shadow-xl shadow-gold/20' : 'bg-sand/8 text-sand/50 hover:bg-sand/14 hover:text-sand border border-sand/10 hover:border-sand/20'}`}
                                >
                                    {t('allProducts')}
                                </button>
                                {categoryPills.map(cat => (
                                    <button
                                        key={cat.slug}
                                        onClick={() => handleCategoryPill(cat.name)}
                                        className={`flex-shrink-0 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${activeCategory === cat.name ? 'bg-gold text-ink shadow-xl shadow-gold/20' : 'bg-sand/8 text-sand/50 hover:bg-sand/14 hover:text-sand border border-sand/10 hover:border-sand/20'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results header */}
                        <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-12">
                            <h3 className="font-display text-xl sm:text-2xl md:text-3xl uppercase text-sand">{categoryLabel}</h3>
                            <div className="text-[10px] font-bold tracking-widest uppercase text-cocoa">
                                {totalCount} {t('results')}
                            </div>
                        </div>

                        {/* Product grid */}
                        {!isLoading && products.length === 0 ? (
                            <div className="text-center py-24 flex flex-col items-center gap-4">
                                <p className="text-6xl">🔍</p>
                                <p className="font-bold text-xl text-sand">{t('noProductsFound')}</p>
                                <button
                                    onClick={resetAll}
                                    className="flex items-center gap-2 px-6 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-colors mt-2"
                                >
                                    <RotateCcw size={11} />
                                    {t('clearFilters')}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
                                {products.map((product, idx) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
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
                            totalCount={totalCount}
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
                resultCount={totalCount}
                availableCategories={availableCategories}
                availableBrands={availableBrands}
                availableTags={availableTags}
            />

            {/* Product side panel */}
            <ProductDetailPanel
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}

export default function ShopPageClient(props: ShopPageClientProps) {
    // No <Suspense> wrapper any more. It existed only because useSearchParams()
    // suspends; its fallback (an empty div) was the entire server-rendered
    // output of this page. With the params resolved on the server there is
    // nothing to suspend on, so the real markup is server-rendered.
    return <ShopPageContent {...props} />;
}
