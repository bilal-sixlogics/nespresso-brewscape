"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
        image: string | null;
        featured_image: string | null;
    } | null;
    user: {
        name: string;
        avatar: string | null;
    } | null;
}

const fallbackAvatar = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=439665&color=fff&size=80`;

const PLACEHOLDER_PRODUCT = '/images/placeholder-coffee.jpg';

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
                setActive(0); // reset to 0 when new data arrives
            })
            .catch(() => setReviews([]))
            .finally(() => setIsLoading(false));
    }, []);

    const count = reviews.length;

    // Clamp active to valid range whenever count changes
    useEffect(() => {
        if (count > 0 && active >= count) {
            setActive(0);
        }
    }, [count, active]);

    // Use refs so next/prev always read the latest values without stale closures
    const countRef = React.useRef(count);
    countRef.current = count;

    const next = useCallback(() => {
        setActive(p => {
            const c = countRef.current;
            return c > 1 ? (p + 1) % c : 0;
        });
    }, []);

    const prev = useCallback(() => {
        setActive(p => {
            const c = countRef.current;
            return c > 1 ? (p - 1 + c) % c : 0;
        });
    }, []);

    // Auto-rotate
    useEffect(() => {
        if (count < 2) return;
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    }, [next, count]);

    // Compute aggregate rating
    const avgRating = useMemo(() => {
        if (count === 0) return 0;
        return reviews.reduce((s, r) => s + r.rating, 0) / count;
    }, [reviews, count]);

    // Loading skeleton
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

    if (count === 0) return null;

    // Safe access — clamp index
    const safeIndex = Math.min(active, count - 1);
    const current = reviews[safeIndex];
    if (!current) return null; // extra safety

    const authorName = current.user?.name ?? current.user_name;
    const avatarSrc = current.user?.avatar || fallbackAvatar(authorName);
    const productImage = current.product?.featured_image || current.product?.image || null;
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
                    {/* Aggregate rating badge — dynamic */}
                    <div className="flex items-center gap-2 bg-white border border-black/5 rounded-xl px-4 py-2 shadow-sm">
                        <div className="flex gap-0.5">
                            {[0, 1, 2, 3, 4].map(i => (
                                <Star key={i} size={10} className={i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                            ))}
                        </div>
                        <span className="text-sb-black font-bold text-xs">{avgRating.toFixed(1)}</span>
                        <span className="text-gray-300 text-[9px]">/ 5</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 items-stretch">
                    {/* LEFT PANEL — product image + author card */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`left-${safeIndex}`}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full flex flex-col gap-6"
                            >
                                {/* Product image */}
                                <div className="relative w-full aspect-[4/3] rounded-[16px] sm:rounded-[24px] overflow-hidden bg-sb-green/10 shrink-0">
                                    {productImage ? (
                                        <Image
                                            src={productImage}
                                            alt={productName}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-sb-green/20 to-sb-green/5 flex items-center justify-center">
                                            <span className="text-5xl">&#9749;</span>
                                        </div>
                                    )}
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

                                {/* Author card — avatar + name + per-review stars */}
                                <div className="bg-white rounded-[20px] border border-black/5 p-5 shadow-sm flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-sb-green/20">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={avatarSrc}
                                            alt={authorName}
                                            width={44}
                                            height={44}
                                            className="w-11 h-11 object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sb-black font-bold text-sm leading-none truncate">{authorName}</div>
                                        <div className="flex gap-0.5 mt-1.5">
                                            {[0, 1, 2, 3, 4].map(i => (
                                                <Star key={i} size={10} className={i < current.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
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

                    {/* RIGHT PANEL — quote */}
                    <div className="bg-white rounded-[28px] border border-black/5 shadow-sm p-8 lg:p-10 flex flex-col justify-between gap-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`quote-${safeIndex}`}
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
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400">{safeIndex + 1} / {count}</span>
                                <div className="flex gap-1">
                                    {reviews.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActive(i)}
                                            className={`h-1 rounded-full transition-all duration-300 ${i === safeIndex ? 'w-6 bg-sb-green' : 'w-1.5 bg-black/10 hover:bg-sb-green/40'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
