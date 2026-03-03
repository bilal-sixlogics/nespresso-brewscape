"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function ProductSkeleton() {
    return (
        <div className="bg-white rounded-[40px] p-4 border border-gray-100 shadow-sm w-full max-w-lg mx-auto relative aspect-[3/4] flex flex-col overflow-hidden">
            {/* Shimmer effect overlay */}
            <motion.div
                className="absolute inset-0 z-10"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                }}
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                }}
            />

            {/* Top Image area */}
            <div className="bg-gray-100 rounded-[32px] h-[65%] w-full mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-200/50 animate-pulse" />
            </div>

            {/* Content area */}
            <div className="px-4 flex flex-col flex-1 justify-between pb-2 h-full">
                <div>
                    {/* Title lines */}
                    <div className="min-h-[70px] flex flex-col gap-2">
                        <div className="h-6 bg-gray-100 rounded-md w-3/4 animate-pulse" />
                        <div className="h-6 bg-gray-100 rounded-md w-1/2 animate-pulse" />
                    </div>

                    {/* Intensity area */}
                    <div className="mt-3 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="h-2 bg-gray-100 rounded w-1/4 animate-pulse" />
                            <div className="h-2 bg-gray-100 rounded w-1/8 animate-pulse" />
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full w-full animate-pulse" />
                    </div>
                </div>

                {/* Bottom area (Brew sizes) */}
                <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                    <div className="flex gap-4 w-full">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                                <div className="h-2 bg-gray-50 rounded w-8 animate-pulse" />
                            </div>
                        ))}
                    </div>
                    {/* Price at bottom right */}
                    <div className="h-8 bg-gray-100 rounded-md w-20 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
