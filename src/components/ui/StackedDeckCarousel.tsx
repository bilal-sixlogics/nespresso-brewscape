"use client";

import React, { useState, useCallback } from "react";
import { motion, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StackedDeckCarouselProps {
  children: React.ReactNode[];
}

// Visual position of each card in the stack (index 0 = front/top).
// y-offsets are large enough that back cards peek below the front card:
//   middle bottom = 48 + 0.94 × H ≈ H + 20px peeking
//   back   bottom = 76 + 0.88 × H ≈ H + 20px peeking
const STACK = [
  { x:  0, y:  0, scale: 1,    rotate:  0, zIndex: 30, opacity: 1   },
  { x: -5, y: 48, scale: 0.94, rotate: -3, zIndex: 20, opacity: 1   },
  { x:  5, y: 76, scale: 0.88, rotate:  5, zIndex: 10, opacity: 0.9 },
];

export function StackedDeckCarousel({ children }: StackedDeckCarouselProps) {
  const cards = React.Children.toArray(children);
  const n = cards.length;

  // front = index of the card currently on top
  const [front, setFront] = useState(0);
  // flying = which card is mid-exit animation
  const [flying, setFlying] = useState<{ idx: number; toLeft: boolean } | null>(null);

  const rotate = useCallback((toLeft: boolean) => {
    if (flying) return;
    setFlying({ idx: front, toLeft });
    setTimeout(() => {
      setFront(p => toLeft ? (p + 1) % n : (p - 1 + n) % n);
      setFlying(null);
    }, 340);
  }, [flying, front, n]);

  return (
    <div className="w-full flex flex-col items-center select-none">

      {/* ── Deck container ──────────────────────────────────────── */}
      {/*
        Width = min(290px, 84vw).
        Card aspect-ratio = 2/3 → card height = width × 1.5.
        Back card (stack[2]): y=76, scale=0.88 → bottom = 76 + 1.5 × width × 0.88 = 76 + 1.32w
          At variable width (84vw): 76 + 1.32 × 84vw = 76 + 110.9vw  (+6px padding)
          At max (290px card): 76 + 382.8 = 458.8px → max ≈ 472px
        isolate creates a stacking context so internal z-indexes don't leak onto siblings.
      */}
      <div
        className="relative isolate"
        style={{
          width: "min(290px, 84vw)",
          height: "clamp(406px, calc(110.9vw + 82px), 472px)",
        }}
      >
        {cards.map((card, ci) => {
          const isFlying  = flying?.idx === ci;
          const stackPos  = (ci - front + n) % n;
          const isVisible = stackPos < 3;

          // Don't render cards that are neither flying nor in the visible top-3
          if (!isFlying && !isVisible) return null;

          const pos = isFlying ? null : STACK[stackPos];

          return (
            <motion.div
              key={ci}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                // Grab cursor only on the front card
                cursor: !flying && stackPos === 0 ? "grab" : "default",
              }}
              animate={
                isFlying
                  ? {
                      x:       flying!.toLeft ? -380 : 380,
                      y:       40,
                      rotate:  flying!.toLeft ? -20 : 20,
                      scale:   0.82,
                      opacity: 0,
                      zIndex:  50,
                    }
                  : {
                      x:       pos!.x,
                      y:       pos!.y,
                      scale:   pos!.scale,
                      rotate:  pos!.rotate,
                      zIndex:  pos!.zIndex,
                      opacity: pos!.opacity,
                    }
              }
              transition={
                isFlying
                  ? { duration: 0.33, ease: [0.25, 0.46, 0.45, 0.94] }
                  : { type: "spring", stiffness: 300, damping: 32 }
              }
              // Drag only on the front card
              drag={!flying && stackPos === 0 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_: unknown, info: PanInfo) => {
                if (info.offset.x < -80)      rotate(true);
                else if (info.offset.x > 80)  rotate(false);
              }}
            >
              {card}
            </motion.div>
          );
        })}
      </div>

      {/* ── Swipe hint ──────────────────────────────────────────── */}
      <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-3">
        <ChevronLeft size={9} /> Swipe to explore <ChevronRight size={9} />
      </p>

      {/* ── Controls ────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 mt-2">
        <button
          onClick={() => rotate(false)}
          disabled={!!flying}
          aria-label="Previous"
          className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-sb-black disabled:opacity-25 transition-all duration-200 hover:border-sb-green hover:text-sb-green active:scale-95"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {cards.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === front
                  ? "w-5 h-1.5 bg-sb-green"
                  : "w-1.5 h-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => rotate(true)}
          disabled={!!flying}
          aria-label="Next"
          className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-sb-black disabled:opacity-25 transition-all duration-200 hover:border-sb-green hover:text-sb-green active:scale-95"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
