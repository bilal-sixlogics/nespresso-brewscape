import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadMoreButtonProps {
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    totalCount?: number;
    text?: string;
    noMoreText?: string;
}

export function LoadMoreButton({
    isLoading,
    hasMore,
    onLoadMore,
    totalCount,
    text = "Load More",
    noMoreText = "No more items to display"
}: LoadMoreButtonProps) {

    if (!hasMore && totalCount && totalCount > 0) {
        return (
            <div className="flex justify-center mt-20 mb-8 opacity-60">
                <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                    {noMoreText}
                </span>
            </div>
        );
    }

    if (!hasMore) {
        return null; // hide if completely empty and no total count given
    }

    return (
        <div className="flex justify-center mt-20 mb-8">
            <button
                onClick={onLoadMore}
                disabled={isLoading}
                className={`relative px-12 py-5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 overflow-hidden 
                    ${isLoading
                        ? 'bg-sb-green/10 text-sb-green border border-sb-green/20 cursor-wait'
                        : 'bg-transparent border border-gray-200 text-gray-500 hover:text-sb-black hover:border-sb-black opacity-100'
                    }`}
            >
                <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    {text}
                </div>

                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 bg-sb-green rounded-full"
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: Infinity,
                                            delay: i * 0.15,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
}
