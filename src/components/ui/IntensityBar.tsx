import React from 'react';
import { motion } from 'framer-motion';

interface IntensityBarProps {
    intensity: number;
}

export function IntensityBar({ intensity }: IntensityBarProps) {
    return (
        <div className="flex flex-col gap-1.5 mt-3">
            <div className="flex items-center justify-between w-full">
                <span className="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase">Intensity</span>
                <span className="text-[10px] font-bold text-sb-black">{intensity} <span className="text-gray-400 font-normal">/ 13</span></span>
            </div>
            <div className="flex items-center gap-[3px] h-4">
                {[...Array(13)].map((_, j) => {
                    const isActive = j < intensity;

                    // The Café Malin intensity scale often goes from light yellow to dark brown/red.
                    // We'll calculate a color gradient based on the intensity level.
                    const hue = 40 - (j * 2.5); // 40 (gold/yellow) to 5 (red/brown)
                    const saturation = 70 + (j * 2); // 70% to 96%
                    const lightness = 60 - (j * 2.5); // 60% to 27%

                    const activeColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

                    return (
                        <motion.div
                            key={j}
                            initial={{ height: 4, opacity: 0 }}
                            animate={{
                                height: isActive ? 16 : 6,
                                opacity: isActive ? 1 : 0.3,
                                backgroundColor: isActive ? activeColor : '#E5E7EB'
                            }}
                            transition={{
                                duration: 0.5,
                                delay: j * 0.05,
                                ease: "easeOut"
                            }}
                            className="flex-1 rounded-full origin-bottom"
                        />
                    );
                })}
            </div>
        </div>
    );
}
