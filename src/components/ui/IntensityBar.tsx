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

/** Returns an HSL color moving from golden-yellow (low) to deep red-brown (high). */
function segmentColor(j: number): string {
    const hue = 40 - j * 2.5;        // 40° (gold) → 5° (dark red)
    const sat = 70 + j * 2;           // 70% → 96%
    const lit = 60 - j * 2.5;         // 60% → 27%
    return `hsl(${hue}, ${sat}%, ${lit}%)`;
}

const sizeMap = {
    card: { barH: 'h-[16px]', inactiveH: 6, activeH: 16, gap: 'gap-[3px]', labelSize: 'text-[9px]', scoreSize: 'text-[10px]' },
    panel: { barH: 'h-[20px]', inactiveH: 8, activeH: 20, gap: 'gap-1', labelSize: 'text-[10px]', scoreSize: 'text-xs' },
    page: { barH: 'h-[24px]', inactiveH: 8, activeH: 24, gap: 'gap-1', labelSize: 'text-xs', scoreSize: 'text-sm' },
};

export function IntensityBar({ intensity, size = 'card', showLabel = true }: IntensityBarProps) {
    const { t } = useLanguage();
    const s = sizeMap[size];

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {showLabel && (
                <div className="flex items-center justify-between w-full">
                    <span className={`${s.labelSize} text-gray-500 font-bold tracking-[0.2em] uppercase`}>
                        {t('intensity')}
                    </span>
                    <span className={`${s.scoreSize} font-bold text-sb-black tabular-nums`}>
                        {intensity}
                        <span className="text-gray-300 font-normal"> / 13</span>
                    </span>
                </div>
            )}
            <div className={`flex items-end ${s.gap} ${s.barH}`}>
                {[...Array(SEGMENT_COUNT)].map((_, j) => {
                    const isActive = j < intensity;
                    return (
                        <motion.div
                            key={j}
                            initial={{ height: 4, opacity: 0 }}
                            animate={{
                                height: isActive ? s.activeH : s.inactiveH,
                                opacity: isActive ? 1 : 0.25,
                                backgroundColor: isActive ? segmentColor(j) : '#E5E7EB',
                            }}
                            transition={{ duration: 0.45, delay: j * 0.04, ease: 'easeOut' }}
                            className="flex-1 rounded-full origin-bottom"
                        />
                    );
                })}
            </div>
        </div>
    );
}
