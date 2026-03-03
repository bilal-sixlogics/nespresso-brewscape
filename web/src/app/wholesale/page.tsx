"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Coffee, Search, CreditCard } from 'lucide-react';

export default function WholesalePage() {
    return (
        <div className="w-full relative bg-sb-white text-sb-black overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Banner */}
                <section className="bg-sb-green pt-20 pb-32 px-8 relative text-white">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">Partner With Us</motion.h2>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-2xl mx-auto text-lg">Premium wholesale coffee solutions for cafes, restaurants, and offices.</motion.p>
                    </div>
                    <div className="torn-paper-white-down z-20"></div>
                </section>

                <section className="bg-sb-white py-24 px-8">
                    <div className="max-w-[1000px] mx-auto text-center">
                        <h3 className="font-display text-4xl lg:text-5xl uppercase mb-6">Elevate Your Coffee Program</h3>
                        <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto mb-16">
                            We offer customized wholesale programs tailored to your business needs, including dedicated support, training, and equipment consultation.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
                            <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="w-12 h-12 bg-sb-green/10 rounded-full flex items-center justify-center mb-6">
                                    <Coffee className="text-sb-green w-5 h-5" />
                                </div>
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-3">Freshly Roasted</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">Roasted to order and shipped immediately to ensure peak freshness for your customers.</p>
                            </div>
                            <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="w-12 h-12 bg-sb-green/10 rounded-full flex items-center justify-center mb-6">
                                    <Search className="text-sb-green w-5 h-5" />
                                </div>
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-3">Expert Support</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">Dedicated account managers and technical support for your brewing equipment.</p>
                            </div>
                            <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="w-12 h-12 bg-sb-green/10 rounded-full flex items-center justify-center mb-6">
                                    <CreditCard className="text-sb-green w-5 h-5" />
                                </div>
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-3">Flexible Terms</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">Competitive tier-based pricing structure to support your growing business needs.</p>
                            </div>
                        </div>

                        <Link href="/contact">
                            <button type="button" className="bg-sb-green text-white px-12 py-5 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-sb-black transition-colors shadow-lg">Inquire Now</button>
                        </Link>
                    </div>
                </section>
            </motion.div>
        </div>
    );
}
