"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { Typography } from '../atoms/Typography';
import { cn } from '@/lib/utils';
import { AppConfig } from '@/lib/config';

export const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={cn(
            "fixed top-0 w-full z-50 transition-all duration-300",
            scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
        )}>
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                <div className="flex z-50 items-center space-x-4">
                    <Menu className="w-6 h-6 text-brand-black cursor-pointer md:hidden" />
                    <Typography variant="h3" className="uppercase tracking-widest text-brand-black">
                        {AppConfig.brand.nameUppercase}
                    </Typography>
                </div>

                <nav className="hidden md:flex items-center space-x-8">
                    {['Coffee', 'Machines', 'Accessories', 'Sustainability'].map((item) => (
                        <a key={item} href="#" className="font-sans font-semibold text-brand-black hover:text-brand-green transition-colors">
                            {item}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center space-x-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-offwhite text-brand-black hover:bg-brand-beige transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-green text-brand-offwhite hover:bg-brand-green/90 transition-colors relative">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-black text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                            2
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
};
