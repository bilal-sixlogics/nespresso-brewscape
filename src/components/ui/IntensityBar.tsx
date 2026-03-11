"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface IntensityBarProps {
    intensity: number;
    /** 'card' = compact (default), 'panel' = medium, 'page' = large */
    size?: 'card' | 'panel' | 'page';
    /** Show the label/score row above the bars */
    showLabel?: boolean;
}

const SEGMENT_COUNT = 13;

/** Gold (low) → dark red (high) */
function segmentColor(j: number): string {
    const hue = 40 - j * 2.5;
    const sat = 70 + j * 2;
    const lit = 60 - j * 2.5;
    return `hsl(${hue}, ${sat}%, ${lit}%)`;
}

const sizeMap = {
    card:  { h: 4, gap: 2, labelSize: 'text-[9px]',  scoreSize: 'text-[10px]' },
    panel: { h: 6, gap: 3, labelSize: 'text-[10px]', scoreSize: 'text-xs'     },
    page:  { h: 8, gap: 4, labelSize: 'text-xs',     scoreSize: 'text-sm'     },
};

export function IntensityBar({ intensity, size = 'card', showLabel = true }: IntensityBarProps) {
    const { t } = useLanguage();
    const s = sizeMap[size];
    // Color of the highest active segment (used to tint the score number)
    const peakColor = intensity > 0 ? segmentColor(intensity - 1) : '#9CA3AF';

    return (
        <div className="flex flex-col gap-1 w-full">
            {showLabel && (
                <div className="flex items-center justify-between w-full">
                    <span className={`${s.labelSize} text-gray-400 font-semibold tracking-[0.15em] uppercase`}>
                        {t('intensity')}
                    </span>
                    <span className={`${s.scoreSize} font-bold tabular-nums`} style={{ color: peakColor }}>
                        {intensity}
                        <span className="text-gray-300 font-normal"> / 13</span>
                    </span>
                </div>
            )}
            {/* Uniform-height segmented bar */}
            <div className="flex w-full" style={{ gap: s.gap, height: s.h }}>
                {[...Array(SEGMENT_COUNT)].map((_, j) => {
                    const isActive = j < intensity;
                    const color = segmentColor(j);
                    return (
                        <motion.div
                            key={j}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.35, delay: j * 0.03, ease: 'easeOut' }}
                            style={{
                                flex: 1,
                                height: s.h,
                                borderRadius: s.h / 2,
                                backgroundColor: isActive ? color : '#E9EAEC',
                                boxShadow: isActive ? `0 0 ${s.h + 2}px ${color}70` : 'none',
                                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
