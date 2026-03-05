"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MobileCarouselProps {
    children: React.ReactNode[];
}

export function MobileCarousel({ children }: MobileCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollPosition = scrollRef.current.scrollLeft;
        const itemWidth = scrollRef.current.clientWidth;
        const index = Math.round(scrollPosition / itemWidth);
        setCurrentIndex(index);
    };

    const scrollTo = (index: number) => {
        if (!scrollRef.current) return;
        const itemWidth = scrollRef.current.clientWidth;
        scrollRef.current.scrollTo({
            left: index * itemWidth,
            behavior: "smooth"
        });
    };

    return (
        <div className="relative w-full group -mx-4 px-4 md:mx-0 md:px-0">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 gap-4 w-full py-6 px-4 sm:px-6 md:px-0"
                style={{ touchAction: 'pan-x' }}
            >
                {React.Children.map(children, (child) => (
                    <div className="w-[85vw] sm:w-[340px] shrink-0 snap-center md:w-auto md:shrink flex">
                        {child}
                    </div>
                ))}
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center justify-center gap-6 mt-2">
                <button
                    onClick={() => scrollTo(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sb-black disabled:opacity-30 shadow-sm transition-colors hover:bg-gray-50"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2.5 items-center">
                    {React.Children.map(children, (_, idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollTo(idx)}
                            className={`rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-5 h-2 bg-sb-green' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
                <button
                    onClick={() => scrollTo(Math.min(React.Children.count(children) - 1, currentIndex + 1))}
                    disabled={currentIndex === React.Children.count(children) - 1}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sb-black disabled:opacity-30 shadow-sm transition-colors hover:bg-gray-50"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
