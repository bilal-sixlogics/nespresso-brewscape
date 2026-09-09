"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import Link from '@/components/LocaleLink';
import { useLanguage } from '@/context/LanguageContext';

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-ink/10 last:border-0">
            <button
                onClick={() => setOpen(p => !p)}
                className="w-full flex justify-between items-start py-5 text-left gap-4 group"
            >
                <span className="font-semibold text-sm text-ink group-hover:text-gold transition-colors leading-relaxed">
                    {q}
                </span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 mt-0.5">
                    <ChevronDown size={18} className="text-ink/30" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-5 text-sm text-ink/60 leading-relaxed pr-8">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQPage() {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');

    const faqs = [
        {
            category: t('faqPageCategory1'),
            items: [
                { q: t('faqPageQ1'), a: t('faqPageA1') },
                { q: t('faqPageQ2'), a: t('faqPageA2') },
                { q: t('faqPageQ3'), a: t('faqPageA3') },
                { q: t('faqPageQ4'), a: t('faqPageA4') },
            ],
        },
        {
            category: t('faqPageCategory2'),
            items: [
                { q: t('faqPageQ5'), a: t('faqPageA5') },
                { q: t('faqPageQ6'), a: t('faqPageA6') },
                { q: t('faqPageQ7'), a: t('faqPageA7') },
                { q: t('faqPageQ8'), a: t('faqPageA8') },
            ],
        },
        {
            category: t('faqPageCategory3'),
            items: [
                { q: t('faqPageQ9'), a: t('faqPageA9') },
                { q: t('faqPageQ10'), a: t('faqPageA10') },
            ],
        },
        {
            category: t('faqPageCategory4'),
            items: [
                { q: t('faqPageQ11'), a: t('faqPageA11') },
                { q: t('faqPageQ12'), a: t('faqPageA12') },
            ],
        },
    ];

    const filtered = query.trim()
        ? faqs.map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
                item.q.toLowerCase().includes(query.toLowerCase()) ||
                item.a.toLowerCase().includes(query.toLowerCase())
            ),
        })).filter(cat => cat.items.length > 0)
        : faqs;

    return (
        <div className="w-full bg-ink text-sand min-h-screen grain-overlay">
            {/* Hero */}
            <section className="bg-ink pt-16 sm:pt-20 md:pt-24 pb-14 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,160,90,0.15),_transparent_60%)] pointer-events-none" />
                <div className="max-w-[900px] mx-auto relative z-10 text-center">
                    <p className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                        {t('support')}
                    </p>
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase text-sand mb-4 sm:mb-6">
                        {t('faqPageHeadingLine1')}
                        <span className="text-gold block">{t('faqPageHeadingLine2')}</span>
                    </h1>
                    <p className="text-sand/50 text-base max-w-lg mx-auto mb-10">
                        {t('faqPageSubtitle')}
                    </p>
                    {/* Search */}
                    <div className="relative max-w-lg mx-auto">
                        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-cocoa" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={t('faqPageSearchPlaceholder')}
                            className="w-full pl-12 pr-5 py-4 rounded-full bg-sand/8 border border-sand/15 text-sand placeholder:text-sand/30 text-sm focus:outline-none focus:border-gold transition-colors"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Accordions */}
            <section className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-5xl mb-4">🔍</p>
                        <p className="font-bold text-xl text-sand">{t('noResults')}</p>
                        <button onClick={() => setQuery('')} className="text-gold text-sm font-bold mt-4 underline">
                            {t('reset')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {filtered.map((cat, ci) => (
                            <motion.div
                                key={ci}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: ci * 0.1 }}
                            >
                                <h2 className="font-display text-2xl uppercase text-sand mb-4 flex items-center gap-3">
                                    <span className="w-6 h-0.5 bg-gold block" />
                                    {cat.category}
                                </h2>
                                <div className="bg-sand rounded-[24px] border border-ink/10 px-6 shadow-sm">
                                    {cat.items.map((item, ii) => (
                                        <FaqItem
                                            key={ii}
                                            q={item.q}
                                            a={item.a}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Contact CTA */}
                <div className="mt-12 sm:mt-16 bg-sand rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 text-center text-ink relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gold/15 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60 mb-3">
                        {t('faqPageNeedHelpEyebrow')}
                    </p>
                    <h3 className="font-display text-3xl uppercase mb-4">
                        {t('faqPageNeedHelpHeading')}
                    </h3>
                    <p className="text-ink/70 text-sm mb-6 max-w-sm mx-auto">
                        {t('faqPageNeedHelpDesc')}
                    </p>
                    {/* Was a raw <a href="/contact">, which drops the locale
                        prefix: every click went to /contact and took a 308 hop
                        through the middleware to /fr/contact. LocaleLink keeps
                        the visitor in their locale and makes it a single
                        request, as every other internal link on the site
                        already is. */}
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-gold text-ink font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#b8914d] transition-all duration-300"
                    >
                        {t('faqPageNeedHelpLink')}
                    </Link>
                </div>
            </section>
        </div>
    );
}
