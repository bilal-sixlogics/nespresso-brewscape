"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { enrichedProducts } from '@/lib/productsData';

export interface FilterState {
    categories: string[];
    intensityRange: [number, number];
    priceRange: [number, number];
    tags: string[];
    inStockOnly: boolean;
}

const DEFAULT_FILTERS: FilterState = {
    categories: [],
    intensityRange: [1, 13],
    priceRange: [0, 500],
    tags: [],
    inStockOnly: false,
};

const ALL_CATEGORIES = [...new Set(enrichedProducts.map(p => p.category).filter(Boolean))] as string[];
const ALL_TAGS = [...new Set(enrichedProducts.flatMap(p => p.tags ?? []))].slice(0, 10);

function RangeSlider({ label, value, min, max, unit = '', onChange }: {
    label: string; value: [number, number]; min: number; max: number; unit?: string;
    onChange: (v: [number, number]) => void;
}) {
    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
                <span className="text-[10px] font-bold text-sb-black">{unit}{value[0]} – {unit}{value[1]}</span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full">
                <div
                    className="absolute h-full bg-sb-green rounded-full"
                    style={{
                        left: `${((value[0] - min) / (max - min)) * 100}%`,
                        right: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
                    }}
                />
                <input
                    type="range" min={min} max={max} value={value[0]}
                    onChange={e => onChange([Math.min(Number(e.target.value), value[1] - 1), value[1]])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <input
                    type="range" min={min} max={max} value={value[1]}
                    onChange={e => onChange([value[0], Math.max(Number(e.target.value), value[0] + 1)])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-gray-100 pb-5 last:border-0">
            <button
                onClick={() => setOpen(p => !p)}
                className="w-full flex items-center justify-between py-4 text-left"
            >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sb-black">{title}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="text-gray-300" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

interface FilterDrawerProps {
    open: boolean;
    onClose: () => void;
    filters: FilterState;
    onChange: (f: FilterState) => void;
    resultCount: number;
}

export function FilterDrawer({ open, onClose, filters, onChange, resultCount }: FilterDrawerProps) {
    const { language } = useLanguage();
    const t = (fr: string, en: string) => language === 'fr' ? fr : en;

    const activeCount = filters.categories.length + filters.tags.length +
        (filters.inStockOnly ? 1 : 0) +
        (filters.intensityRange[0] !== 1 || filters.intensityRange[1] !== 13 ? 1 : 0) +
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0);

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                    />
                )}
            </AnimatePresence>

            {/* Drawer */}
            <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: open ? 0 : '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full w-full sm:w-[360px] bg-white z-[95] shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal size={18} className="text-sb-green" />
                        <span className="font-black text-sm uppercase tracking-widest">{t('Filtres', 'Filters')}</span>
                        {activeCount > 0 && (
                            <span className="w-5 h-5 bg-sb-green text-white text-[9px] font-black rounded-full flex items-center justify-center">{activeCount}</span>
                        )}
                    </div>
                    <button onClick={onClose} className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <X size={15} />
                    </button>
                </div>

                {/* Scrollable filter body */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    {/* In stock */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sb-black">{t('En stock uniquement', 'In Stock Only')}</span>
                        <button
                            onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
                            className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${filters.inStockOnly ? 'bg-sb-green' : 'bg-gray-200'}`}
                        >
                            <motion.div
                                animate={{ x: filters.inStockOnly ? 24 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>

                    {/* Categories */}
                    <Section title={t('Catégorie', 'Category')}>
                        <div className="flex flex-wrap gap-2 pb-2">
                            {ALL_CATEGORIES.map(cat => {
                                const active = filters.categories.includes(cat);
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => onChange({ ...filters, categories: toggle(filters.categories, cat) })}
                                        className={`px-3.5 py-2 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${active ? 'bg-sb-green text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-sb-green/30'}`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </Section>

                    {/* Intensity */}
                    <Section title={t('Intensité', 'Intensity')}>
                        <div className="pb-2">
                            <RangeSlider
                                label="" value={filters.intensityRange} min={1} max={13}
                                onChange={v => onChange({ ...filters, intensityRange: v })}
                            />
                            <div className="flex justify-between mt-2">
                                {[1, 4, 7, 10, 13].map(v => (
                                    <span key={v} className="text-[8px] text-gray-300 font-bold">{v}</span>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* Price */}
                    <Section title={t('Prix (€)', 'Price (€)')}>
                        <div className="pb-2">
                            <RangeSlider
                                label="" value={filters.priceRange} min={0} max={500} unit="€"
                                onChange={v => onChange({ ...filters, priceRange: v })}
                            />
                        </div>
                    </Section>

                    {/* Tags */}
                    {ALL_TAGS.length > 0 && (
                        <Section title="Tags">
                            <div className="flex flex-wrap gap-2 pb-2">
                                {ALL_TAGS.map(tag => {
                                    const active = filters.tags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => onChange({ ...filters, tags: toggle(filters.tags, tag) })}
                                            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${active ? 'bg-sb-black text-white' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-gray-300'}`}
                                        >
                                            #{tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </Section>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-5 flex gap-3">
                    <button
                        onClick={() => onChange(DEFAULT_FILTERS)}
                        className="flex-1 py-3.5 rounded-full border-2 border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-gray-300 transition-colors"
                    >
                        {t('Réinitialiser', 'Reset')}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-full bg-sb-green text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sb-green/20 hover:bg-[#2C6345] transition-colors"
                    >
                        {t(`Voir ${resultCount} résultats`, `Show ${resultCount} results`)}
                    </button>
                </div>
            </motion.aside>
        </>
    );
}

export function applyFilters(products: Product[], filters: FilterState): Product[] {
    return products.filter(p => {
        if (filters.categories.length > 0 && !filters.categories.includes(p.category ?? '')) return false;
        if (filters.inStockOnly && p.inStock === false) return false;
        if (p.intensity != null) {
            if (p.intensity < filters.intensityRange[0] || p.intensity > filters.intensityRange[1]) return false;
        }
        const price = p.saleUnits?.[0]?.price ?? p.price;
        if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
        if (filters.tags.length > 0 && !filters.tags.some(tag => p.tags?.includes(tag))) return false;
        return true;
    });
}

export { DEFAULT_FILTERS };
