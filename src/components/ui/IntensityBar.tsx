"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { CoffeeBeanIcon } from '@/components/icons/CoffeeBeanIcon';

interface IntensityBarProps {
    /** Raw intensity on the product's native 1–13 scale — scaled down to a 5-bean legend for display. */
    intensity: number;
    /** 'card' = compact (default), 'panel' = medium, 'page' = large */
    size?: 'card' | 'panel' | 'page';
    /** Show the label/score row above the beans */
    showLabel?: boolean;
    /** 'gold' (default) for use on dark/ink backgrounds, 'cocoa' for use on beige backgrounds */
    tone?: 'gold' | 'cocoa';
}

const BEAN_COUNT = 5;
const SOURCE_MAX = 13;

const sizeMap = {
    card: { beanSize: 14, gap: 'gap-[3px]', labelSize: 'text-[9px]', scoreSize: 'text-[10px]' },
    panel: { beanSize: 18, gap: 'gap-1', labelSize: 'text-[10px]', scoreSize: 'text-xs' },
    page: { beanSize: 22, gap: 'gap-1.5', labelSize: 'text-xs', scoreSize: 'text-sm' },
};

export function IntensityBar({ intensity, size = 'card', showLabel = true, tone = 'gold' }: IntensityBarProps) {
    const { t } = useLanguage();
    const s = sizeMap[size];
    const toneClass = tone === 'gold' ? 'text-gold' : 'text-cocoa';
    // Scale the product's native 1–13 intensity onto a 5-bean legend, with a
    // floor of 1 so any positive intensity always shows at least one full bean.
    const filledBeans = intensity > 0 ? Math.max(1, Math.min(BEAN_COUNT, Math.round((intensity / SOURCE_MAX) * BEAN_COUNT))) : 0;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {showLabel && (
                <div className="flex items-center justify-between w-full">
                    <span className={`${s.labelSize} text-cocoa font-bold tracking-[0.2em] uppercase`}>
                        {t('intensity')}
                    </span>
                    <span className={`${s.scoreSize} font-bold ${toneClass} tabular-nums`}>
                        {filledBeans}
                        <span className="opacity-40 font-normal"> / {BEAN_COUNT}</span>
                    </span>
                </div>
            )}
            <div className={`flex items-center ${s.gap}`}>
                {[...Array(BEAN_COUNT)].map((_, j) => {
                    const isActive = j < filledBeans;
                    return (
                        <motion.div
                            key={j}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: isActive ? 1 : 0.35, scale: 1 }}
                            transition={{ duration: 0.35, delay: j * 0.06, ease: 'easeOut' }}
                            className={toneClass}
                        >
                            <CoffeeBeanIcon filled={isActive} size={s.beanSize} />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
