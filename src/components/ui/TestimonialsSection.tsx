"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Image from 'next/image';

const AVATAR_URLS = [
    'https://i.pravatar.cc/100?img=7',
    'https://i.pravatar.cc/100?img=9',
    'https://i.pravatar.cc/100?img=11',
    'https://i.pravatar.cc/100?img=47',
];

const PRODUCT_IMAGES = [
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497933321188-941f9ad36b12?q=80&w=600&auto=format&fit=crop',
];

const RATINGS = [5, 5, 5, 4];

export const TestimonialsSection = () => {
    const { t } = useLanguage();
    const [active, setActive] = useState(0);

    const testimonials = [
        { text: t('testimonial1Text'), author: t('testimonial1Author'), role: t('testimonial1Role'), product: t('testimonial1Product') },
        { text: t('testimonial2Text'), author: t('testimonial2Author'), role: t('testimonial2Role'), product: t('testimonial2Product') },
        { text: t('testimonial3Text'), author: t('testimonial3Author'), role: t('testimonial3Role'), product: t('testimonial3Product') },
        { text: t('testimonial4Text'), author: t('testimonial4Author'), role: t('testimonial4Role'), product: t('testimonial4Product') },
    ];

    const next = useCallback(() => setActive((p) => (p + 1) % testimonials.length), [testimonials.length]);
    const prev = useCallback(() => setActive((p) => (p - 1 + testimonials.length) % testimonials.length), [testimonials.length]);

    useEffect(() => {
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    }, [next]);

    const current = testimonials[active];

    return (
        <section className="bg-[#FAF9F6] border-t border-black/5 py-10 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-12 overflow-hidden">
            <div className="max-w-[1400px] mx-auto">
                {/* Section label */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-px bg-sb-green" />
                        <span className="text-[9px] font-black tracking-[0.35em] uppercase text-sb-green">{t('reviews')}</span>
                    </div>
                    {/* Overall aggregate */}
                    <div className="flex items-center gap-2 bg-white border border-black/5 rounded-xl px-4 py-2 shadow-sm">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-amber-400 text-amber-400" />)}
                        </div>
                        <span className="text-sb-black font-bold text-xs">4.9</span>
                        <span className="text-gray-300 text-[9px]">/ 5</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 items-stretch">
                    {/* ── LEFT PANEL — changes with active ── */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`left-${active}`}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full flex flex-col gap-6"
                            >
                                {/* Product image */}
                                <div className="relative w-full aspect-[4/3] rounded-[16px] sm:rounded-[24px] overflow-hidden bg-sb-green/10 shrink-0">
                                    <Image
                                        src={PRODUCT_IMAGES[active]}
                                        alt={current.product}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    {/* Product label overlay */}
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <span className="text-[9px] font-black text-white/70 uppercase tracking-widest block mb-0.5">{t('verifiedPurchase')}</span>
                                        <span className="text-white font-semibold text-sm leading-tight line-clamp-2">{current.product}</span>
                                    </div>
                                </div>

                                {/* Author card */}
                                <div className="bg-white rounded-[20px] border border-black/5 p-5 shadow-sm flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-sb-green/20">
                                        <Image src={AVATAR_URLS[active]} alt={current.author} width={44} height={44} className="object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sb-black font-bold text-sm leading-none truncate">{current.author}</div>
                                        <div className="text-gray-400 text-[10px] uppercase tracking-widest mt-1 truncate">{current.role}</div>
                                        <div className="flex gap-0.5 mt-1.5">
                                            {[...Array(RATINGS[active])].map((_, i) => <Star key={i} size={10} className="fill-amber-400 text-amber-400" />)}
                                        </div>
                                    </div>
                                    <div className="ml-auto shrink-0">
                                        <CheckCircle2 size={16} className="text-sb-green" />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── RIGHT PANEL — quote + nav ── */}
                    <div className="bg-white rounded-[28px] border border-black/5 shadow-sm p-8 lg:p-10 flex flex-col justify-between gap-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`quote-${active}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col gap-6 flex-1"
                            >
                                {/* Big quote icon */}
                                <Quote size={32} className="text-sb-green/20 shrink-0" />

                                {/* Quote text */}
                                <blockquote className="text-sb-black text-xl lg:text-2xl font-light leading-relaxed flex-1">
                                    "{current.text}"
                                </blockquote>
                            </motion.div>
                        </AnimatePresence>

                        {/* Bottom: navigation + counter */}
                        <div className="flex items-center justify-between pt-6 border-t border-black/5">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prev}
                                    className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 text-black/40 hover:border-sb-green hover:text-sb-green hover:bg-sb-green/5 transition-all duration-300"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={next}
                                    className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 text-black/40 hover:border-sb-green hover:text-sb-green hover:bg-sb-green/5 transition-all duration-300"
                                >
                                    <ChevronRight size={16} />
                                </button>
                                <span className="text-gray-300 text-xs font-mono ml-2">
                                    {String(active + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                                </span>
                            </div>

                            {/* Progress dots */}
                            <div className="flex gap-1.5">
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActive(i)}
                                        className={`h-0.5 rounded-full transition-all duration-500 ${i === active ? 'w-8 bg-sb-green' : 'w-3 bg-black/10 hover:bg-black/20'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
