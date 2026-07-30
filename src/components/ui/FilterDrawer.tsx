"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Product, getDisplayPrice, isInStock, getTagLabels } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export interface FilterState {
    brands: string[];
    categories: string[];
    intensityRange: [number, number];
    priceRange: [number, number];
    tags: string[];
    inStockOnly: boolean;
}

const DEFAULT_FILTERS: FilterState = {
    brands: [],
    categories: [],
    intensityRange: [1, 13],
    priceRange: [0, 500],
    tags: [],
    inStockOnly: false,
};

function RangeSlider({ label, value, min, max, unit = '', onChange }: {
    label: string; value: [number, number]; min: number; max: number; unit?: string;
    onChange: (v: [number, number]) => void;
}) {
    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-cocoa">{label}</span>
                <span className="text-[10px] font-bold text-sand">{unit}{value[0]} – {unit}{value[1]}</span>
            </div>
            <div className="relative h-5 flex items-center">
                {/* Track */}
                <div className="absolute left-0 right-0 h-1.5 bg-sand/15 rounded-full" />
                {/* Active range */}
                <div
                    className="absolute h-1.5 bg-gold rounded-full"
                    style={{
                        left: `${((value[0] - min) / (max - min)) * 100}%`,
                        right: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
                    }}
                />
                {/* Low thumb */}
                <input
                    type="range" min={min} max={max} value={value[0]}
                    onChange={e => onChange([Math.min(Number(e.target.value), value[1] - 1), value[1]])}
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: value[0] > (max - min) / 2 + min ? 5 : 3 }}
                />
                {/* High thumb */}
                <input
                    type="range" min={min} max={max} value={value[1]}
                    onChange={e => onChange([value[0], Math.max(Number(e.target.value), value[0] + 1)])}
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: value[0] > (max - min) / 2 + min ? 3 : 5 }}
                />
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-sand/10 pb-4 sm:pb-5 last:border-0">
            <button
                onClick={() => setOpen(p => !p)}
                className="w-full flex items-center justify-between py-3 sm:py-4 text-left min-h-[44px]"
            >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sand">{title}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="text-sand/40" />
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
    availableCategories?: string[];
    availableBrands?: string[];
    availableTags?: string[];
}

export function FilterDrawer({ open, onClose, filters, onChange, resultCount, availableCategories = [], availableBrands = [], availableTags = [] }: FilterDrawerProps) {
    const { language } = useLanguage();
    const t = (fr: string, en: string) => language === 'fr' ? fr : en;
    const { currency_symbol } = useSiteSettings();

    // Detect mobile for bottom-sheet vs left-drawer
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Portals require a DOM node — only available once mounted on the client.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const activeCount = filters.brands.length + filters.categories.length + filters.tags.length +
        (filters.inStockOnly ? 1 : 0) +
        (filters.intensityRange[0] !== 1 || filters.intensityRange[1] !== 13 ? 1 : 0) +
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0);

    // Mobile = bottom sheet, desktop = left drawer — beige panel on the black page per the brief
    const panelClass = isMobile
        ? "fixed bottom-0 left-0 right-0 w-full max-h-[88vh] rounded-t-3xl bg-ink z-[95] shadow-2xl flex flex-col"
        : "fixed top-0 left-0 h-full w-[360px] bg-ink z-[95] shadow-2xl flex flex-col";

    const initialAnim = isMobile ? { y: '100%' } : { x: '-100%' };
    const openAnim = isMobile ? { y: 0 } : { x: 0 };
    const closedAnim = isMobile ? { y: '100%' } : { x: '-100%' };

    if (!mounted) return null;

    return createPortal(
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

            {/* Drawer / Sheet */}
            <motion.aside
                initial={initialAnim}
                animate={open ? openAnim : closedAnim}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={panelClass}
            >
                {/* Mobile drag handle */}
                {isMobile && (
                    <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                        <div className="w-10 h-1 bg-sand/30 rounded-full" />
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-5 border-b border-sand/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal size={16} className="text-gold" />
                        <span className="font-black text-sm uppercase tracking-widest text-sand">{t('Filtres', 'Filters')}</span>
                        {activeCount > 0 && (
                            <span className="w-5 h-5 bg-gold text-ink text-[9px] font-black rounded-full flex items-center justify-center">{activeCount}</span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 bg-sand/10 rounded-full flex items-center justify-center text-sand hover:bg-sand/20 transition-colors"
                        aria-label="Close filters"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Scrollable filter body */}
                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-1">
                    {/* In stock toggle */}
                    <div className="flex items-center justify-between py-3 sm:py-4 border-b border-sand/10 min-h-[52px]">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sand">{t('En stock uniquement', 'In Stock Only')}</span>
                        <button
                            onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
                            role="switch"
                            aria-checked={filters.inStockOnly}
                            aria-label="In stock only"
                            className={`w-12 h-6 rounded-full transition-colors duration-200 relative focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ${filters.inStockOnly ? 'bg-gold' : 'bg-sand/15'}`}
                        >
                            <motion.div
                                animate={{ x: filters.inStockOnly ? 24 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-1 w-4 h-4 bg-sand rounded-full shadow-sm"
                            />
                        </button>
                    </div>

                    {/* Categories */}
                    <Section title={t('Catégorie', 'Category')}>
                        <div className="flex flex-wrap gap-2 pb-2">
                            {availableCategories.map(cat => {
                                const active = filters.categories.includes(cat);
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => onChange({ ...filters, categories: toggle(filters.categories, cat) })}
                                        aria-pressed={active}
                                        className={`min-h-[44px] px-3.5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ${active ? 'bg-gold text-ink shadow-sm' : 'bg-sand/10 text-sand/70 border border-sand/15 hover:border-gold/40'}`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </Section>

                    {/* Brands */}
                    {availableBrands.length > 0 && (
                        <Section title={t('Marque', 'Brand')}>
                            <div className="flex flex-wrap gap-2 pb-2">
                                {availableBrands.map(brand => {
                                    const active = filters.brands.includes(brand);
                                    return (
                                        <button
                                            key={brand}
                                            onClick={() => onChange({ ...filters, brands: toggle(filters.brands, brand) })}
                                            aria-pressed={active}
                                            className={`min-h-[44px] px-3.5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ${active ? 'bg-gold text-ink shadow-sm' : 'bg-sand/10 text-sand/70 border border-sand/15 hover:border-sand/30'}`}
                                        >
                                            {brand === 'nespresso' ? 'Nespresso' : brand === 'starbucks' ? 'Starbucks' : brand}
                                        </button>
                                    );
                                })}
                            </div>
                        </Section>
                    )}

                    {/* Intensity */}
                    <Section title={t('Intensité', 'Intensity')}>
                        <div className="pb-3">
                            <RangeSlider
                                label="" value={filters.intensityRange} min={1} max={13}
                                onChange={v => onChange({ ...filters, intensityRange: v })}
                            />
                            <div className="flex justify-between mt-2">
                                {[1, 4, 7, 10, 13].map(v => (
                                    <span key={v} className="text-[10px] text-cocoa font-bold">{v}</span>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* Price */}
                    <Section title={t(`Prix (${currency_symbol})`, `Price (${currency_symbol})`)}>
                        <div className="pb-3">
                            <RangeSlider
                                label="" value={filters.priceRange} min={0} max={500} unit={currency_symbol}
                                onChange={v => onChange({ ...filters, priceRange: v })}
                            />
                        </div>
                    </Section>

                    {/* Tags */}
                    {availableTags.length > 0 && (
                        <Section title="Tags">
                            <div className="flex flex-wrap gap-2 pb-2">
                                {availableTags.map(tag => {
                                    const active = filters.tags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => onChange({ ...filters, tags: toggle(filters.tags, tag) })}
                                            aria-pressed={active}
                                            className={`min-h-[44px] px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ${active ? 'bg-gold text-ink' : 'bg-sand/10 text-sand/60 border border-sand/15 hover:border-sand/30'}`}
                                        >
                                            #{tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </Section>
                    )}

                    {/* Bottom spacer so content isn't hidden under footer */}
                    <div className="h-4" />
                </div>

                {/* Footer */}
                <div className="border-t border-sand/10 px-5 sm:px-6 py-4 sm:py-5 flex gap-3 flex-shrink-0">
                    <button
                        onClick={() => onChange(DEFAULT_FILTERS)}
                        className="flex-1 py-3.5 rounded-full border-2 border-sand/20 text-[10px] font-black uppercase tracking-widest text-sand/70 hover:border-sand/40 transition-colors min-h-[48px]"
                    >
                        {t('Réinitialiser', 'Reset')}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-full bg-gold text-ink text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:bg-[#b8914d] transition-colors min-h-[48px]"
                    >
                        {t(`Voir ${resultCount} résultats`, `Show ${resultCount} results`)}
                    </button>
                </div>
            </motion.aside>
        </>,
        document.body
    );
}

export function applyFilters(products: Product[], filters: FilterState): Product[] {
    return products.filter(p => {
        if (filters.brands.length > 0 && !filters.brands.includes(p.brand?.name ?? '')) return false;
        if (filters.categories.length > 0 && !filters.categories.includes(p.category?.name ?? '')) return false;
        if (filters.inStockOnly && !isInStock(p)) return false;
        if (p.intensity != null) {
            if (p.intensity < filters.intensityRange[0] || p.intensity > filters.intensityRange[1]) return false;
        }
        const price = getDisplayPrice(p);
        if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
        if (filters.tags.length > 0) {
            const productTags = getTagLabels(p);
            if (!filters.tags.some(tag => productTags.includes(tag))) return false;
        }
        return true;
    });
}

export { DEFAULT_FILTERS };
