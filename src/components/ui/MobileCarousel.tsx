"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MobileCarouselProps {
    children: React.ReactNode[];
    /** How many cards to show per viewport. Defaults: mobile=1.3, sm=2.3, md=3.3, lg=4, xl=5 */
    peek?: boolean;
}

export function MobileCarousel({ children, peek = true }: MobileCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const count = React.Children.count(children);

    const getItemWidth = useCallback(() => {
        if (!scrollRef.current) return 0;
        const firstChild = scrollRef.current.querySelector<HTMLElement>(':first-child');
        return firstChild ? firstChild.offsetWidth + parseFloat(getComputedStyle(firstChild).marginRight || '0') : 0;
    }, []);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const firstChild = scrollRef.current.querySelector<HTMLElement>(':first-child');
        if (!firstChild) return;
        const itemW = firstChild.offsetWidth + 24; // 24 = gap-6
        const idx = Math.round(scrollLeft / itemW);
        setCurrentIndex(Math.max(0, Math.min(idx, count - 1)));
    }, [count]);

    const scrollTo = useCallback((index: number) => {
        if (!scrollRef.current) return;
        const firstChild = scrollRef.current.querySelector<HTMLElement>(':first-child');
        if (!firstChild) return;
        const itemW = firstChild.offsetWidth + 24;
        scrollRef.current.scrollTo({ left: index * itemW, behavior: 'smooth' });
    }, []);

    // Arrow-key support
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (document.activeElement?.closest('[data-carousel]')) {
                if (e.key === 'ArrowLeft') scrollTo(Math.max(0, currentIndex - 1));
                if (e.key === 'ArrowRight') scrollTo(Math.min(count - 1, currentIndex + 1));
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [currentIndex, count, scrollTo]);

    return (
        <div className="relative" data-carousel>
            {/* Left nav arrow */}
            <button
                onClick={() => scrollTo(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                aria-label="Previous"
                className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-gray-100 shadow-md items-center justify-center text-sb-black disabled:opacity-0 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
            >
                <ChevronLeft size={18} />
            </button>

            {/* Right nav arrow */}
            <button
                onClick={() => scrollTo(Math.min(count - 1, currentIndex + 1))}
                disabled={currentIndex >= count - 1}
                aria-label="Next"
                className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-gray-100 shadow-md items-center justify-center text-sb-black disabled:opacity-0 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
            >
                <ChevronRight size={18} />
            </button>

            {/* Scrollable track */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar py-10 -my-10 px-1 -mx-1 select-none"
                style={{ touchAction: 'pan-x' }}
            >
                {React.Children.map(children, (child) => (
                    <div
                        className={[
                            'shrink-0 snap-start',
                            // How many cards visible: mobile 1.15 peek, sm 2, md 3, lg 4, xl 5
                            peek
                                ? 'w-[calc(85vw-2rem)] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-20px)]'
                                : 'w-[calc(100%-2rem)] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-20px)]',
                            'flex items-stretch',
                        ].join(' ')}
                    >
                        {child}
                    </div>
                ))}
            </div>

            {/* Dot indicators — always visible */}
            <div className="flex items-center justify-center gap-2 mt-6">
                {React.Children.map(children, (_, idx) => (
                    <button
                        key={idx}
                        onClick={() => scrollTo(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-6 h-2 bg-sb-green' : 'w-2 h-2 bg-gray-200 hover:bg-gray-400'}`}
                    />
                ))}
            </div>
        </div>
    );
}
