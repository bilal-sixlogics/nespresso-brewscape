"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Image from 'next/image';
import { Endpoints } from '@/lib/api/endpoints';

interface FeaturedReview {
    id: number;
    rating: number;
    comment: string | null;
    user_name: string;
    is_verified_purchase: boolean;
    product: {
        name: string;
        slug: string;
        featured_image: string | null;
    } | null;
    user: {
        name: string;
        avatar: string | null;
    } | null;
}

// Fallback avatar when the user has none
const fallbackAvatar = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=439665&color=fff&size=80`;

// Fallback product image
const fallbackProduct =
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600&auto=format&fit=crop';

export const TestimonialsSection = () => {
    const [reviews, setReviews] = useState<FeaturedReview[]>([]);
    const [active, setActive] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(Endpoints.featuredReviews)
            .then(r => r.json())
            .then(json => {
                const data: FeaturedReview[] = json?.data ?? [];
                setReviews(data);
            })
            .catch(() => setReviews([]))
            .finally(() => setIsLoading(false));
    }, []);

    const count = reviews.length;
    const next = useCallback(() => setActive(p => (p + 1) % count), [count]);
    const prev = useCallback(() => setActive(p => (p - 1 + count) % count), [count]);

    useEffect(() => {
        if (count < 2) return;
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    }, [next, count]);

    // While loading, show skeleton
    if (isLoading) {
        return (
            <section className="bg-[#FAF9F6] border-t border-black/5 py-10 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-12">
                <div className="max-w-[1400px] mx-auto animate-pulse">
                    <div className="h-6 w-40 bg-black/5 rounded-lg mb-10" />
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8">
                        <div className="aspect-[4/3] rounded-[24px] bg-black/5" />
                        <div className="rounded-[28px] bg-black/5 h-64" />
                    </div>
                </div>
            </section>
        );
    }

    // No featured reviews yet — render nothing
    if (count === 0) return null;

    const current = reviews[active];
    const authorName = current.user?.name ?? current.user_name;
    const avatarSrc = current.user?.avatar ?? fallbackAvatar(authorName);
    const productImage = current.product?.featured_image ?? fallbackProduct;
    const productName = current.product?.name ?? 'Brewscape Selection';

    return (
        <section className="bg-[#FAF9F6] border-t border-black/5 py-10 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-12 overflow-hidden">
            <div className="max-w-[1400px] mx-auto">
                {/* Section label */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-px bg-sb-green" />
                        <span className="text-[9px] font-black tracking-[0.35em] uppercase text-sb-green">Reviews</span>
                    </div>
                    {/* Aggregate rating badge */}
                    {(() => {
                        const avg = reviews.reduce((s, r) => s + r.rating, 0) / count;
                        const rounded = Math.round(avg);
                        return (
                            <div className="flex items-center gap-2 bg-white border border-black/5 rounded-xl px-4 py-2 shadow-sm">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} className={i < rounded ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                                    ))}
                                </div>
                                <span className="text-sb-black font-bold text-xs">{avg.toFixed(1)}</span>
                                <span className="text-gray-300 text-[9px]">/ 5</span>
                            </div>
                        );
                    })()}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 items-stretch">
                    {/* ── LEFT PANEL ── */}
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
                                        src={productImage}
                                        alt={productName}
                                        fill
                                        className="object-cover"
                                        unoptimized={!productImage.startsWith('/')}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        {current.is_verified_purchase && (
                                            <span className="text-[9px] font-black text-white/70 uppercase tracking-widest block mb-0.5">
                                                Verified Purchase
                                            </span>
                                        )}
                                        <span className="text-white font-semibold text-sm leading-tight line-clamp-2">{productName}</span>
                                    </div>
                                </div>

                                {/* Author card */}
                                <div className="bg-white rounded-[20px] border border-black/5 p-5 shadow-sm flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-sb-green/20">
                                        <Image
                                            src={avatarSrc}
                                            alt={authorName}
                                            width={44}
                                            height={44}
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sb-black font-bold text-sm leading-none truncate">{authorName}</div>
                                        <div className="flex gap-0.5 mt-1.5">
                                            {[...Array(current.rating)].map((_, i) => (
                                                <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="ml-auto shrink-0">
                                        <CheckCircle2 size={16} className="text-sb-green" />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── RIGHT PANEL ── */}
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
                                <Quote size={32} className="text-sb-green/20 shrink-0" />
                                <blockquote className="text-sb-black text-xl lg:text-2xl font-light leading-relaxed flex-1">
                                    &ldquo;{current.comment ?? `Rated ${current.rating} out of 5 stars.`}&rdquo;
                                </blockquote>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
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
                                    {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                                </span>
                            </div>

                            <div className="flex gap-1.5">
                                {reviews.map((_, i) => (
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
