"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productDatabase, allProducts, categoriesList } from '@/lib/productsData';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailPanel } from '@/components/ui/ProductDetailPanel';
import { Product } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import { LoadMoreButton } from '@/components/ui/LoadMoreButton';
import { ProductSkeleton } from '@/components/ui/ProductSkeleton';
import { useLanguage } from '@/context/LanguageContext';

const allProductsCombined = allProducts;

export default function ShopPage() {
    const { t, language } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState<string>(t('allProducts'));
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const filteredProducts = useMemo(() => {
        if (selectedCategory === t('allProducts')) return allProducts;
        return productDatabase[selectedCategory] || allProducts;
    }, [selectedCategory, t]);

    const { displayedItems: displayedProducts, hasMore, isLoading, loadMore, reset, totalCount } = usePagination(filteredProducts, 8);

    React.useEffect(() => {
        reset();
    }, [selectedCategory, reset]);

    return (
        <div className="w-full relative bg-sb-white text-sb-black overflow-x-hidden min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Banner */}
                <section className="bg-sb-green pt-20 pb-32 px-8 relative text-white">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">{t('shopTitle')}</motion.h2>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-2xl mx-auto text-lg">{t('shopSubtitle')}</motion.p>
                    </div>
                    <div className="torn-paper-white-down z-20"></div>
                </section>

                <section className="bg-sb-white py-24 px-8">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex gap-4 overflow-x-auto whitespace-nowrap no-scrollbar pb-8 mb-12 border-b border-gray-100 items-center justify-start lg:justify-center w-full">
                            {[t('allProducts'), ...categoriesList].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-shrink-0 px-8 py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${selectedCategory === cat ? 'bg-sb-green text-white shadow-xl shadow-sb-green/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-sb-black border border-gray-100 hover:border-gray-200'}`}
                                >
                                    {cat === t('allProducts') ? cat : t(cat as any)}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-12">
                            <h3 className="font-display text-3xl uppercase text-sb-black">{selectedCategory === t('allProducts') ? selectedCategory : t(selectedCategory as any)}</h3>
                            <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{t('showing')} {filteredProducts.length} {t('results')}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {displayedProducts.map((product, idx) => (
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

            <ProductDetailPanel
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}
