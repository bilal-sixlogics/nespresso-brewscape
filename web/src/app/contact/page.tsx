"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
    return (
        <div className="w-full relative bg-sb-white text-sb-black overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Banner */}
                <section className="bg-sb-green pt-20 pb-32 px-8 relative text-white">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">Let's Connect</motion.h2>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-2xl mx-auto text-lg">Have a question or just want to chat coffee? We're here for you.</motion.p>
                    </div>
                    <div className="torn-paper-white-down z-20"></div>
                </section>

                <section className="bg-sb-white py-24 px-8">
                    <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-16">
                        <div className="flex-1">
                            <h3 className="font-display text-4xl uppercase mb-8">Send a Message</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">First Name</label>
                                        <input type="text" className="w-full border-b border-gray-200 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent" placeholder="Jane" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Last Name</label>
                                        <input type="text" className="w-full border-b border-gray-200 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Email Address</label>
                                    <input type="email" className="w-full border-b border-gray-200 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent" placeholder="jane@example.com" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Message</label>
                                    <textarea rows={4} className="w-full border-b border-gray-200 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent resize-none" placeholder="How can we help?" />
                                </div>
                                <button type="button" className="bg-sb-green text-white px-10 py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-sb-black transition-colors shadow-lg">Send Inquiry</button>
                            </form>
                        </div>
                        <div className="w-full lg:w-[400px]">
                            <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Headquarters</h4>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    1234 Espresso Avenue<br />
                                    Suite 500<br />
                                    Seattle, WA 98101
                                </p>
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Contact Details</h4>
                                <p className="text-gray-500 leading-relaxed">
                                    hello@brewscape.com<br />
                                    +1 (800) 555-0199
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </motion.div>
        </div>
    );
}
