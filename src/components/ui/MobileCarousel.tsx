"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MobileCarouselProps {
  children: React.ReactNode[];
}

export function MobileCarousel({ children }: MobileCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [page, setPage]     = useState(0);

  // Group children into pairs (2 per page on mobile)
  const arr   = React.Children.toArray(children);
  const pairs = [];
  for (let i = 0; i < arr.length; i += 2) {
    pairs.push(arr.slice(i, Math.min(i + 2, arr.length)));
  }
  const numPages = pairs.length;

  const goTo = useCallback((p: number) => {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(p, numPages - 1));
    scrollRef.current.scrollTo({ left: clamped * scrollRef.current.clientWidth, behavior: "smooth" });
    setPage(clamped);
  }, [numPages]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    setPage(Math.round(scrollLeft / Math.max(1, clientWidth)));
  }, []);

  // Reset to page 0 if children change
  useEffect(() => { setPage(0); }, [arr.length]);

  return (
    <div className="relative">
      {/* ── Desktop grid ── */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-8 -my-8">
        {arr.map((child, i) => (
          <div key={i} className="flex items-stretch">{child}</div>
        ))}
      </div>

      {/* ── Mobile paginated carousel ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="md:hidden flex overflow-x-auto no-scrollbar py-8 -my-8"
        style={{ scrollSnapType: "x mandatory", touchAction: "pan-x" }}
      >
        {pairs.map((pair, i) => (
          <div
            key={i}
            className="flex gap-3 px-4 shrink-0"
            style={{ minWidth: "100%", scrollSnapAlign: "start" }}
          >
            {pair.map((child, j) => (
              <div key={j} className="flex-1 min-w-0 flex items-stretch">{child}</div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Mobile controls ── */}
      {numPages > 1 && (
        <div className="md:hidden flex items-center justify-center gap-5 mt-2">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-sb-black disabled:opacity-25 transition-all duration-200 hover:border-sb-green hover:text-sb-green active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: numPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Page ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === page
                    ? "w-5 h-1.5 bg-sb-green"
                    : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => goTo(page + 1)}
            disabled={page >= numPages - 1}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-sb-black disabled:opacity-25 transition-all duration-200 hover:border-sb-green hover:text-sb-green active:scale-95"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
