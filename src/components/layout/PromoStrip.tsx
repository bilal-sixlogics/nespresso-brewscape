"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AppConfig } from '@/lib/config';
import { useLanguage } from '@/context/LanguageContext';

export function PromoStrip() {
    const { language } = useLanguage();
    const [visible, setVisible] = useState(true);
    const [currentIdx, setCurrentIdx] = useState(0);

    const banner = AppConfig.promoBanner;
    if (!banner.enabled) return null;

    const messages = language === 'fr' ? banner.messages : banner.messagesEn;

    // Cycle through messages every 4s
    useEffect(() => {
        if (messages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIdx(prev => (prev + 1) % messages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [messages.length]);

    if (!visible) return null;

    return (
        <div className="bg-sb-black text-white relative z-[200] overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="text-[10px] font-bold tracking-[0.2em] uppercase text-center flex-1"
                    >
                        {messages[currentIdx]}
                    </motion.p>
                </AnimatePresence>

                {messages.length > 1 && (
                    <div className="flex gap-1 items-center">
                        {messages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIdx(i)}
                                className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentIdx ? 'bg-white w-3' : 'bg-white/30'}`}
                                aria-label={`Message ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                <button
                    onClick={() => setVisible(false)}
                    className="ml-2 text-white/50 hover:text-white transition-colors flex-shrink-0"
                    aria-label="Dismiss"
                >
                    <X size={12} />
                </button>
            </div>
        </div>
    );
}
