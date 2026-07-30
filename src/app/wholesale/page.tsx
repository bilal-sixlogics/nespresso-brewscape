"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Coffee, Search, CreditCard } from 'lucide-react';
import { CupSeparator } from '@/components/ui/CupSeparator';

export default function WholesalePage() {
    return (
        <div className="w-full relative bg-ink text-sand overflow-x-hidden grain-overlay">
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Banner */}
                <section className="bg-ink pt-20 pb-16 px-8 relative text-sand">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">Partner With Us</motion.h2>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-sand/60 max-w-2xl mx-auto text-lg">Premium wholesale coffee solutions for cafes, restaurants, and offices.</motion.p>
                        <div className="max-w-xs mx-auto mt-10">
                            <CupSeparator tone="gold" />
                        </div>
                    </div>
                </section>

                <section className="bg-ink py-24 px-8">
                    <div className="max-w-[1000px] mx-auto text-center">
                        <h3 className="font-display text-4xl lg:text-5xl uppercase mb-6 text-sand">Elevate Your Coffee Program</h3>
                        <p className="text-sand/60 text-lg leading-relaxed max-w-2xl mx-auto mb-16">
                            We offer customized wholesale programs tailored to your business needs, including dedicated support, training, and equipment consultation.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
                            <div className="bg-sand p-8 rounded-[30px] shadow-sm border border-ink/10 hover:shadow-xl transition-shadow">
                                <div className="w-12 h-12 bg-gold/15 rounded-full flex items-center justify-center mb-6">
                                    <Coffee className="text-gold w-5 h-5" />
                                </div>
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-3 text-ink">Freshly Roasted</h4>
                                <p className="text-ink/60 text-sm leading-relaxed">Roasted to order and shipped immediately to ensure peak freshness for your customers.</p>
                            </div>
                            <div className="bg-sand p-8 rounded-[30px] shadow-sm border border-ink/10 hover:shadow-xl transition-shadow">
                                <div className="w-12 h-12 bg-gold/15 rounded-full flex items-center justify-center mb-6">
                                    <Search className="text-gold w-5 h-5" />
                                </div>
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-3 text-ink">Expert Support</h4>
                                <p className="text-ink/60 text-sm leading-relaxed">Dedicated account managers and technical support for your brewing equipment.</p>
                            </div>
                            <div className="bg-sand p-8 rounded-[30px] shadow-sm border border-ink/10 hover:shadow-xl transition-shadow">
                                <div className="w-12 h-12 bg-gold/15 rounded-full flex items-center justify-center mb-6">
                                    <CreditCard className="text-gold w-5 h-5" />
                                </div>
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-3 text-ink">Flexible Terms</h4>
                                <p className="text-ink/60 text-sm leading-relaxed">Competitive tier-based pricing structure to support your growing business needs.</p>
                            </div>
                        </div>

                        <Link href="/contact">
                            <button type="button" className="bg-gold text-ink px-12 py-5 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-[#b8914d] transition-colors shadow-lg">Inquire Now</button>
                        </Link>
                    </div>
                </section>
            </motion.div>
        </div>
    );
}
