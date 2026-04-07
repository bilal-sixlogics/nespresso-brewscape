"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Coffee, CheckCircle2, Loader2 } from 'lucide-react';
import { AppConfig } from '@/lib/config';
import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
    const { t } = useLanguage();
    const [nlEmail, setNlEmail] = useState('');
    const [nlState, setNlState] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubscribe = () => {
        if (!nlEmail.trim() || !nlEmail.includes('@')) return;
        setNlState('loading');
        setTimeout(() => {
            setNlState('success');
            setTimeout(() => { setNlState('idle'); setNlEmail(''); }, 3000);
        }, 1200);
    };

    return (
        <footer className="bg-sb-black text-white relative z-20 pt-40 px-4 pb-10">
            <div className="max-w-[1400px] mx-auto relative z-10">

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-20">

                    {/* Brand */}
                    <div className="space-y-8">
                        <h1 className="font-display text-2xl lg:text-3xl tracking-tight uppercase leading-none">
                            {AppConfig.brand.name}
                            <br />
                            <span className="text-base font-sans font-bold tracking-[0.2em] opacity-80 mt-1 block">{AppConfig.brand.tagline}</span>
                        </h1>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            {t('brandDescription')}
                        </p>
                        <div className="flex space-x-3">
                            {AppConfig.socials.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    aria-label={social.name}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    className="w-11 h-11 bg-white/5 hover:bg-sb-green border border-white/10 hover:border-sb-green rounded-full flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition-all duration-300 focus-visible:outline-2 focus-visible:outline-sb-green focus-visible:outline-offset-2"
                                >
                                    {social.name}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-xs tracking-[0.2em] uppercase mb-8 text-white">{t('quickLinks')}</h4>
                        <ul className="space-y-4 flex flex-col items-start">
                            <li><Link href="/" className="text-gray-400 hover:text-sb-green transition-colors text-sm">{t('navHome')}</Link></li>
                            <li><Link href="/machines" className="text-gray-400 hover:text-sb-green transition-colors text-sm">{t('navMachines')}</Link></li>
                            <li><Link href="/brew-guide" className="text-gray-400 hover:text-sb-green transition-colors text-sm">{t('navBrewGuide')}</Link></li>
                            <li><Link href="/shop" className="text-gray-400 hover:text-sb-green transition-colors text-sm">{t('navShop')}</Link></li>
                            <li><Link href="/sweets" className="text-gray-400 hover:text-sb-green transition-colors text-sm">{t('navSweets')}</Link></li>
                            <li><Link href="/blog" className="text-gray-400 hover:text-sb-green transition-colors text-sm">{t('navBlog')}</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-xs tracking-[0.2em] uppercase mb-8 text-white">{t('support')}</h4>
                        <ul className="space-y-4">
                            {AppConfig.supportLinks.map((link) => (
                                <li key={link.label}><Link href={link.url} className="text-gray-400 hover:text-sb-green transition-colors text-sm">{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-xs tracking-[0.2em] uppercase mb-8 text-white">{t('stayConnected')}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">{t('subscribeHero')}</p>
                        {nlState === 'success' ? (
                            <div className="flex items-center gap-3 bg-sb-green/20 border border-sb-green/30 rounded-full px-5 py-3">
                                <CheckCircle2 size={16} className="text-white" />
                                <span className="text-sm font-bold text-white">Subscribed! Welcome aboard ☕</span>
                            </div>
                        ) : (
                            <div className="flex">
                                <label htmlFor="footer-newsletter-email" className="sr-only">{t('emailPlaceholder')}</label>
                                <input
                                    id="footer-newsletter-email"
                                    type="email"
                                    value={nlEmail}
                                    onChange={e => setNlEmail(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                                    placeholder={t('emailPlaceholder')}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-l-full px-5 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-sb-green transition-colors"
                                    disabled={nlState === 'loading'}
                                />
                                <button
                                    onClick={handleSubscribe}
                                    disabled={nlState === 'loading'}
                                    className="bg-sb-green hover:bg-sb-dark text-white px-6 py-3 rounded-r-full text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 disabled:opacity-60"
                                >
                                    {nlState === 'loading' ? <Loader2 size={14} className="animate-spin" /> : t('join')}
                                </button>
                            </div>
                        )}
                        <div className="mt-8 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-sb-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Coffee className="w-5 h-5 text-sb-green" />
                            </div>
                            <div>
                                <div className="text-sm font-bold">{t('freeShipping')}</div>
                                <div className="text-xs text-gray-500">{t('freeShippingDesc')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-xs tracking-widest uppercase">© {AppConfig.brand.copyrightYear} {AppConfig.brand.name}. {t('copyright')}</p>
                    <div className="flex space-x-8 mt-4 md:mt-0">
                        <button className="text-gray-500 hover:text-white text-xs tracking-widest uppercase transition-colors">{t('privacy')}</button>
                        <button className="text-gray-500 hover:text-white text-xs tracking-widest uppercase transition-colors">{t('terms')}</button>
                        <button className="text-gray-500 hover:text-white text-xs tracking-widest uppercase transition-colors">{t('cookies')}</button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
