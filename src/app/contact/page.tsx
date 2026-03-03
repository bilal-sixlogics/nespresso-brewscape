"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Globe, Coffee as CoffeeIcon } from 'lucide-react';
import { AppConfig } from '@/lib/config';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
    const { t } = useLanguage();
    return (
        <div className="w-full relative bg-sb-white text-sb-black overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            >
                {/* Hero Banner */}
                <section className="bg-sb-green pt-20 pb-32 px-8 relative text-white">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">{t('contactTitle')}</motion.h2>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-2xl mx-auto text-lg">{t('contactSubtitle')}</motion.p>
                    </div>
                    <div className="torn-paper-white-down z-20"></div>
                </section>

                <section className="bg-sb-white py-24 px-8">
                    <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-16">
                        <div className="flex-1">
                            <h3 className="font-display text-4xl uppercase mb-8">{t('sendMessage')}</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">{t('firstName')}</label>
                                        <input type="text" className="w-full border-b border-gray-200 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent" placeholder="Jane" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">{t('lastName')}</label>
                                        <input type="text" className="w-full border-b border-gray-200 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">{t('emailAddress')}</label>
                                    <input type="email" className="w-full border-b border-gray-200 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent" placeholder="jane@example.com" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">{t('message')}</label>
                                    <textarea rows={4} className="w-full border-b border-gray-200 py-3 focus:border-sb-green focus:outline-none transition-colors bg-transparent resize-none" placeholder={t('messagePlaceholder')} />
                                </div>
                                <button type="button" className="bg-sb-green text-white px-10 py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-sb-black transition-colors shadow-lg">{t('sendInquiry')}</button>
                            </form>
                        </div>
                        <div className="w-full lg:w-[400px]">
                            <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-6">{t('headquarters')}</h4>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <MapPin className="text-sb-green shrink-0" size={20} />
                                        <div className="text-sm text-gray-600 leading-relaxed">
                                            16 Boulevard du Général de Gaulle,<br />
                                            95200 Sarcelles, France
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Phone className="text-sb-green shrink-0" size={20} />
                                        <div className="text-sm text-gray-600">
                                            +33 1 34 19 62 10
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Mail className="text-sb-green shrink-0" size={20} />
                                        <div className="text-sm text-gray-600">
                                            contact@cafrezzo.com
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 pt-10 border-t border-gray-200">
                                    <h4 className="font-bold uppercase tracking-widest text-sm mb-6">{t('contactDetails')}</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">SIRET</span>
                                            <span className="font-medium">84126359500010</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">TVA</span>
                                            <span className="font-medium">FR39841263595</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </motion.div>
        </div>
    );
}
