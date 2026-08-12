"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Trash2, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AppConfig } from '@/lib/config';

const sections = [
    {
        icon: Eye,
        slug: undefined,
        titleKey: 'legalPrivacySection1Title',
        contentKey: 'legalPrivacySection1Content',
    },
    {
        icon: Lock,
        slug: undefined,
        titleKey: 'legalPrivacySection2Title',
        contentKey: 'legalPrivacySection2Content',
    },
    {
        icon: Shield,
        slug: undefined,
        titleKey: 'legalPrivacySection3Title',
        contentKey: 'legalPrivacySection3Content',
    },
    {
        icon: Trash2,
        slug: undefined,
        titleKey: 'legalPrivacySection4Title',
        contentKey: 'legalPrivacySection4Content',
    },
    {
        icon: Mail,
        slug: 'cookies',
        titleKey: 'legalPrivacySection5Title',
        contentKey: 'legalPrivacySection5Content',
    },
] as const;

export default function PrivacyPage() {
    const { t } = useLanguage();
    const [active, setActive] = useState<number | null>(null);

    // Deep-link support — e.g. Footer's "Cookie Policy" links to /privacy#cookies
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (!hash) return;
        const index = sections.findIndex(s => s.slug === hash);
        if (index === -1) return;
        setActive(index);
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    return (
        <div className="w-full bg-ink text-sand min-h-screen grain-overlay">
            {/* Hero */}
            <section className="bg-ink pt-24 pb-16 px-8">
                <div className="max-w-[900px] mx-auto">
                    <p className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                        {t('legalPrivacyEyebrow')}
                    </p>
                    <h1 className="font-display text-6xl md:text-7xl uppercase text-sand mb-4">
                        {t('legalPrivacyHeadingLine1')} <span className="text-gold">{t('legalPrivacyHeadingLine2')}</span>
                    </h1>
                    <p className="text-sand/50 text-sm">
                        {t('legalPrivacyLastUpdated')} · {AppConfig.brand.name}
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-[900px] mx-auto px-8 py-16">
                <p className="text-sand/70 text-base leading-relaxed mb-12 bg-sand/8 border border-sand/10 rounded-[20px] p-6">
                    {t('legalPrivacyIntro').replace(/\{\{brand\}\}/g, AppConfig.brand.name)}
                </p>

                <div className="space-y-4">
                    {sections.map((sec, i) => {
                        const Icon = sec.icon;
                        const open = active === i;
                        return (
                            <motion.div
                                key={i}
                                id={sec.slug}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-sand/8 border border-sand/10 rounded-[20px] overflow-hidden shadow-sm scroll-mt-24"
                            >
                                <button
                                    onClick={() => setActive(open ? null : i)}
                                    className="w-full flex items-center gap-4 p-6 text-left hover:bg-sand/14 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-gold/15 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon size={18} className="text-gold" />
                                    </div>
                                    <span className="font-bold text-sm flex-1 text-sand">
                                        {t(sec.titleKey)}
                                    </span>
                                    <span className="text-cocoa/50 text-lg">{open ? '−' : '+'}</span>
                                </button>
                                {open && (
                                    <div className="px-6 pb-6 border-t border-sand/10 pt-4">
                                        <p className="text-sm text-sand/60 leading-relaxed whitespace-pre-line">
                                            {t(sec.contentKey)}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Contact */}
                <div className="mt-12 bg-gold/10 border border-gold/25 rounded-[20px] p-6">
                    <p className="font-bold text-sm mb-2 text-sand">{t('legalPrivacyContactHeading')}</p>
                    <p className="text-sm text-sand/70">
                        {t('legalPrivacyContactText')}
                        <a href="mailto:dpo@cafrezzo.com" className="text-gold font-bold hover:underline">
                            dpo@cafrezzo.com
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
}
