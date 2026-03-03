"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/store/CartContext';
import { AppConfig } from '@/lib/config';
import { useLanguage } from '@/context/LanguageContext';

export function Header() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <header className="bg-sb-green text-white relative z-50 pt-2 pb-[30px] -mb-[30px]">
            <div className="max-w-[1600px] mx-auto w-full flex border-b border-white/20 relative z-10">

                {/* Logo Area */}
                <Link href="/" className="w-[240px] lg:w-[300px] p-4 lg:p-5 flex flex-col justify-center border-r border-white/20 hover:bg-white/5 transition-colors">
                    <h1 className="font-display text-lg lg:text-2xl tracking-tight uppercase leading-none">
                        {AppConfig.brand.name}
                        <br />
                        <span className="text-sm lg:text-base font-sans font-bold tracking-[0.2em] opacity-80 mt-1 block px-1">{t('brandTagline')}</span>
                    </h1>
                </Link>

                {/* Navigation Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex border-b border-white/20 text-[10px] font-bold tracking-[0.15em] uppercase">
                        <Link href="/" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>{t('navHome')}</Link>
                        <Link href="/visit-shop" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/visit-shop' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>{t('navVisitShop')}</Link>
                        <Link href="/brew-guide" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/brew-guide' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>{t('navBrewGuide')}</Link>
                        <Link href="/contact" className={`flex-1 p-3 lg:p-4 flex items-center justify-center hover:bg-white/10 transition-colors ${pathname === '/contact' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>{t('contactUs')}</Link>
                    </div>
                    <div className="flex-1 flex text-[10px] font-bold tracking-[0.15em] uppercase relative">
                        <Link href="/shop" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/shop' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>{t('navShop')}</Link>
                        <Link href="/wholesale" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/wholesale' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>{t('navWholesale')}</Link>
                        <Link href="/blog" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/blog' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>{t('navBlog')}</Link>

                        {/* Premium mobile-style Language Switcher */}
                        <div className="flex-1 flex items-center justify-center hover:bg-white/5 transition-all group/lang relative px-4">
                            <div className="flex items-center gap-1.5">
                                <motion.div
                                    animate={{ rotate: language === 'fr' ? 0 : 360 }}
                                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                                    className="text-white/20 group-hover/lang:text-white/100 transition-colors"
                                >
                                    <Globe size={13} strokeWidth={2} />
                                </motion.div>

                                <div className="bg-white/10 backdrop-blur-3xl p-1 rounded-full flex items-center relative border border-white/20 w-[86px] h-[34px] shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                                    {/* Animated Background Pill */}
                                    <motion.div
                                        className="absolute h-[26px] w-[38px] bg-white rounded-full z-0 shadow-[0_5px_15px_rgba(255,255,255,0.3)]"
                                        initial={false}
                                        animate={{
                                            x: language === 'fr' ? 3 : 41
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                    />

                                    <button
                                        onClick={() => setLanguage('fr')}
                                        className={`flex-1 text-[9px] font-black z-10 transition-all duration-300 h-full flex items-center justify-center relative tracking-[0.1em] ${language === 'fr' ? 'text-sb-black' : 'text-white/40 hover:text-white'}`}
                                    >
                                        FR
                                    </button>

                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`flex-1 text-[9px] font-black z-10 transition-all duration-300 h-full flex items-center justify-center relative tracking-[0.1em] ${language === 'en' ? 'text-sb-black' : 'text-white/40 hover:text-white'}`}
                                    >
                                        EN
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Icons */}
                        <div className="absolute top-0 right-0 h-full flex items-center pr-4 space-x-3 z-50 pointer-events-none">
                            <button className="w-8 h-8 flex items-center justify-center rounded-full pointer-events-auto cursor-pointer hover:bg-white/10 transition-colors text-white">
                                <Search size={14} />
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 bg-white rounded-full flex items-center justify-center relative shadow-sm pointer-events-auto cursor-pointer"
                            >
                                <ShoppingBag size={13} className="text-sb-black" />
                                <AnimatePresence>
                                    {cartCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-sb-black text-white text-[8px] flex items-center justify-center font-black shadow-sm"
                                        >
                                            {cartCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
