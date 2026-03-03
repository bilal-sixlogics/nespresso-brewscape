"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/store/CartContext';
import { AppConfig } from '@/lib/config';

export function Header() {
    const pathname = usePathname();
    const { cartCount } = useCart();

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
                        <span className="text-sm lg:text-base font-sans font-bold tracking-[0.2em] opacity-80 mt-1 block">{AppConfig.brand.tagline}</span>
                    </h1>
                </Link>

                {/* Navigation Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex border-b border-white/20 text-[10px] font-bold tracking-[0.15em] uppercase">
                        <Link href="/" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>Home</Link>
                        <Link href="/visit-shop" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/visit-shop' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>Visit Shop</Link>
                        <Link href="/brew-guide" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/brew-guide' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>Brew Guide</Link>
                        <Link href="/contact" className={`flex-1 p-3 lg:p-4 flex items-center justify-center hover:bg-white/10 transition-colors ${pathname === '/contact' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>Contact</Link>
                    </div>
                    <div className="flex-1 flex text-[10px] font-bold tracking-[0.15em] uppercase relative">
                        <Link href="/shop" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/shop' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>Shop</Link>
                        <Link href="/wholesale" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/wholesale' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>Wholesale</Link>
                        <Link href="/blog" className={`flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors ${pathname === '/blog' ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'}`}>Blog</Link>
                        <button className="flex-1 p-3 lg:p-4 flex items-center justify-center hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-not-allowed">Social Media</button>

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

            {/* The torn edge at the absolute bottom of the header */}
            {/* <div
                className={`${pathname === '/' ? 'torn-paper-white-up' : pathname === '/blog' ? 'torn-paper-offwhite-up' : 'torn-paper-green-up'} z-20 w-full`}
                style={{ top: 'auto', bottom: 0, position: 'absolute' }}
            ></div> */}
        </header>
    );
}
