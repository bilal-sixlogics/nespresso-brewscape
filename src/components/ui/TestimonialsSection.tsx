"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
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

const COLORS = ['#3B7E5A', '#2D5F41', '#1e4a34', '#4a9b6b', '#5aad7a'];

function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={size}
                    className={i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
                />
            ))}
        </div>
    );
}

function Avatar({ name, src }: { name: string; src: string | null }) {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const color = COLORS[name.charCodeAt(0) % COLORS.length];

    if (src) {
        return (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={src} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        );
    }
    return (
        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg" style={{ background: color }}>
            {initials}
        </div>
    );
}

export const TestimonialsSection = () => {
    const [reviews, setReviews] = useState<FeaturedReview[]>([]);
    const [active, setActive] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [direction, setDirection] = useState(1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        fetch(Endpoints.featuredReviews)
            .then(r => r.json())
            .then(json => { setReviews(json?.data ?? []); })
            .catch(() => setReviews([]))
            .finally(() => setIsLoading(false));
    }, []);

    const count = reviews.length;

    const go = useCallback((dir: 1 | -1) => {
        setDirection(dir);
        setActive(p => (p + dir + count) % count);
    }, [count]);

    const next = useCallback(() => go(1), [go]);
    const prev = useCallback(() => go(-1), [go]);

    // Auto-rotate
    useEffect(() => {
        if (count < 2) return;
        intervalRef.current = setInterval(next, 7000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [next, count]);

    const pause = () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    const resume = () => { if (count >= 2) intervalRef.current = setInterval(next, 7000); };

    const avgRating = useMemo(() => {
        if (!count) return 0;
        return reviews.reduce((s, r) => s + r.rating, 0) / count;
    }, [reviews, count]);

    if (isLoading) {
        return (
            <section className="bg-white py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse h-96 rounded-3xl bg-gray-100" />
                </div>
            </section>
        );
    }

    if (!count) return null;

    const safeIndex = Math.min(active, count - 1);
    const current = reviews[safeIndex];
    if (!current) return null;

    const authorName = current.user?.name ?? current.user_name;
    const productImage = current.product?.featured_image ?? null;
    const productName = current.product?.name ?? 'Cafrezzo Selection';

    const variants = {
        enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60, filter: 'blur(6px)' }),
        center: { opacity: 1, x: 0, filter: 'blur(0px)' },
        exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60, filter: 'blur(6px)' }),
    };

    return (
        <section
            className="relative overflow-hidden py-20 sm:py-28 lg:py-32 bg-white"
            onMouseEnter={pause}
            onMouseLeave={resume}
        >

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-6"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-px bg-[#3B7E5A]" />
                            <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[#3B7E5A]">Customer Stories</span>
                        </div>
                        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-gray-900 uppercase leading-[0.88] tracking-tight">
                            What They<br />
                            <span className="text-[#3B7E5A]">Say</span>
                        </h2>
                    </div>

                    {/* Aggregate rating */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4"
                    >
                        <div className="text-center">
                            <div className="font-display text-3xl text-gray-900 leading-none">{avgRating.toFixed(1)}</div>
                            <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Rating</div>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div>
                            <StarRow rating={Math.round(avgRating)} size={14} />
                            <div className="text-[9px] text-gray-400 mt-1.5">{count} reviews</div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Main card */}
                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 lg:gap-8 items-stretch">

                    {/* LEFT — Product image card */}
                    <div className="relative h-[280px] sm:h-[340px] lg:h-auto">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={`img-${safeIndex}`}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-0 rounded-[24px] overflow-hidden"
                            >
                                {/* Product image or fallback */}
                                {productImage ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={productImage}
                                        alt={productName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl"
                                        style={{ background: 'linear-gradient(135deg, #1e4a34, #0f2318)' }}>
                                        ☕
                                    </div>
                                )}

                                {/* Gradient overlay */}
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />

                                {/* Product label */}
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    {current.is_verified_purchase && (
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <CheckCircle2 size={10} className="text-[#3B7E5A]" />
                                            <span className="text-[9px] font-black text-[#3B7E5A] uppercase tracking-widest">Verified Purchase</span>
                                        </div>
                                    )}
                                    <p className="text-white font-semibold text-sm leading-snug line-clamp-2">{productName}</p>
                                </div>

                                {/* Gloss overlay */}
                                <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)' }} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* RIGHT — Review card */}
                    <div
                        className="relative rounded-[28px] overflow-hidden flex flex-col bg-gray-50 border border-gray-200"
                    >
                        {/* Inner top gloss */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent" />

                        <div className="flex flex-col flex-1 p-8 lg:p-10">

                            {/* Quote icon */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <Quote size={40} className="text-[#3B7E5A]/40 mb-6" />
                            </motion.div>

                            {/* Stars */}
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={`stars-${safeIndex}`}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                    className="mb-5"
                                >
                                    <StarRow rating={current.rating} size={16} />
                                </motion.div>
                            </AnimatePresence>

                            {/* Quote text */}
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.blockquote
                                    key={`quote-${safeIndex}`}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                                    className="flex-1 text-gray-700 text-xl sm:text-2xl lg:text-[1.6rem] font-light leading-relaxed"
                                >
                                    &ldquo;{current.comment ?? `Exceptional quality — rated ${current.rating} out of 5 stars.`}&rdquo;
                                </motion.blockquote>
                            </AnimatePresence>

                            {/* Divider */}
                            <div className="h-px bg-gray-200 my-7" />

                            {/* Author + nav row */}
                            <div className="flex items-center justify-between gap-4">

                                {/* Author */}
                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={`author-${safeIndex}`}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#3B7E5A]/40 shrink-0">
                                            <Avatar name={authorName} src={current.user?.avatar ?? null} />
                                        </div>
                                        <div>
                                            <div className="text-gray-900 font-bold text-sm">{authorName}</div>
                                            <div className="text-gray-400 text-[10px] uppercase tracking-widest mt-0.5">Cafrezzo Customer</div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation */}
                                <div className="flex items-center gap-3 shrink-0">
                                    {/* Dots */}
                                    <div className="flex items-center gap-1.5 mr-2">
                                        {reviews.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setDirection(i > safeIndex ? 1 : -1); setActive(i); }}
                                                className={`rounded-full transition-all duration-400 ${i === safeIndex ? 'w-5 h-1.5 bg-[#3B7E5A]' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'}`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={prev}
                                        className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={next}
                                        className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 bg-[#3B7E5A] text-white hover:bg-[#2D5F41]"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-[2px] bg-gray-200">
                            <motion.div
                                key={safeIndex}
                                className="h-full bg-[#3B7E5A]"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 7, ease: 'linear' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
