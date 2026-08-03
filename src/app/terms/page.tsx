"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { AppConfig } from '@/lib/config';

const termsContent = [
    { num: '01', titleKey: 'legalTermsSection1Title', bodyKey: 'legalTermsSection1Body' },
    { num: '02', titleKey: 'legalTermsSection2Title', bodyKey: 'legalTermsSection2Body' },
    { num: '03', titleKey: 'legalTermsSection3Title', bodyKey: 'legalTermsSection3Body' },
    { num: '04', titleKey: 'legalTermsSection4Title', bodyKey: 'legalTermsSection4Body' },
    { num: '05', titleKey: 'legalTermsSection5Title', bodyKey: 'legalTermsSection5Body' },
    { num: '06', titleKey: 'legalTermsSection6Title', bodyKey: 'legalTermsSection6Body' },
    { num: '07', titleKey: 'legalTermsSection7Title', bodyKey: 'legalTermsSection7Body' },
] as const;

export default function TermsPage() {
    const { t } = useLanguage();
    const brandName = AppConfig.brand.name;

    return (
        <div className="w-full bg-ink text-sand min-h-screen grain-overlay">
            {/* Hero */}
            <section className="bg-ink pt-24 pb-16 px-8">
                <div className="max-w-[900px] mx-auto">
                    <p className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                        {t('legalTermsEyebrow')}
                    </p>
                    <h1 className="font-display text-5xl md:text-7xl uppercase text-sand mb-4">
                        {t('legalTermsHeadingLine1')} <span className="text-gold">{t('legalTermsHeadingLine2')}</span>
                    </h1>
                    <p className="text-sand/50 text-sm">
                        {t('legalTermsEffectiveDate')} · {AppConfig.brand.name}
                    </p>
                </div>
            </section>

            {/* Terms content */}
            <section className="max-w-[900px] mx-auto px-8 py-16">
                <div className="space-y-6">
                    {termsContent.map((sec, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            className="bg-sand/8 border border-sand/10 rounded-[20px] p-8 shadow-sm"
                        >
                            <div className="flex items-start gap-5">
                                <span className="font-display text-4xl text-gold/20 leading-none flex-shrink-0">
                                    {sec.num}
                                </span>
                                <div>
                                    <h2 className="font-bold text-base text-sand mb-3">
                                        {t(sec.titleKey)}
                                    </h2>
                                    <p className="text-sm text-sand/60 leading-relaxed">
                                        {t(sec.bodyKey).replace(/\{\{brand\}\}/g, brandName)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact */}
                <div className="mt-10 bg-sand/5 border border-sand/10 rounded-[20px] p-6 text-center">
                    <p className="text-sm text-sand/70">
                        {t('legalTermsContactLabel')}
                        <a href={`mailto:${AppConfig.brand.email}`} className="text-gold font-bold hover:underline">
                            {AppConfig.brand.email}
                        </a>
                        {' · '}
                        <span>{AppConfig.brand.address}</span>
                    </p>
                </div>
            </section>
        </div>
    );
}
