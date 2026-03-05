"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, ChevronDown, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/store/CartContext';
import { useAuth } from '@/context/AuthContext';
import { AppConfig } from '@/lib/config';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '@/context/LanguageContext';
import { enrichedProducts } from '@/lib/productsData';
import { CartDrawer } from '@/components/ui/CartDrawer';

// ─── Type ─────────────────────────────────────────────────────────────────
interface NavLink { href: string; labelKey: string; active?: boolean }

// ─── Search ───────────────────────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const results = query.length > 1
        ? enrichedProducts.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.nameEn ?? '').toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8)
        : [];


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[30000] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Input */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
                    <Search size={18} className="text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="flex-1 text-base text-sb-black placeholder-gray-300 outline-none bg-transparent"
                    />
                    <button onClick={onClose} className="text-gray-300 hover:text-sb-black transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto p-4">
                    {query.length > 1 && results.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-8">{t('noResults')}</p>
                    )}
                    {results.length > 0 && (
                        <div>
                            <p className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-400 mb-3 px-2">
                                {t('searchProducts')}
                            </p>
                            <div className="grid grid-cols-1 gap-1">
                                {results.map(p => (
                                    <Link
                                        key={p.id}
                                        href={`/shop/${p.slug ?? p.id}`}
                                        onClick={onClose}
                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-sb-black truncate">{p.name}</p>
                                            {p.namePart2 && <p className="text-[10px] text-gray-400">{p.namePart2}</p>}
                                        </div>
                                        <span className="text-sm font-bold text-sb-green flex-shrink-0">
                                            €{p.price.toFixed(2)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                    {query.length <= 1 && (
                        <div className="grid grid-cols-2 gap-3 p-2">
                            {[
                                { label: t('searchProducts'), href: '/shop' },
                                { label: t('searchMachines'), href: '/machines' },
                                { label: t('searchSweets'), href: '/sweets' },
                                { label: t('searchLocations'), href: '/contact' },
                            ].map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Language Toggle ────────────────────────────────────────────────────────
function LanguageToggle({ direction = 'down' }: { direction?: 'up' | 'down' }) {
    const { language, setLanguage, currentLanguageMeta } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 transition-all duration-200 group"
            >
                <span className="text-base leading-none">{currentLanguageMeta.flag}</span>
                <span className="text-[10px] font-black tracking-[0.1em] text-white">
                    {currentLanguageMeta.label}
                </span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={10} className="text-white/60" />
                </motion.div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: direction === 'down' ? 6 : -6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: direction === 'down' ? 4 : -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${direction === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'} right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[150px] z-50`}
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => { setLanguage(lang.code as Language); setOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${language === lang.code ? 'bg-sb-green/5' : ''
                                    }`}
                            >
                                <span className="text-base">{lang.flag}</span>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-sb-black">{lang.nativeName}</span>
                                </div>
                                {language === lang.code && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-sb-green" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Header ────────────────────────────────────────────────────────────────
export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { cartCount } = useCart();
    const { isAuthenticated, openLoginModal, user } = useAuth();
    const { t } = useLanguage();
    const [searchOpen, setSearchOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setMobileMenuOpen(false); // Close mobile menu on route change
    }, [pathname]);

    // Close search/menu on ESC
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const topRow: NavLink[] = [
        { href: '/', labelKey: 'navHome' },
        { href: '/machines', labelKey: 'navMachines' },
        { href: '/sweets', labelKey: 'navSweets' },
        { href: '/contact', labelKey: 'navContact' },
    ];

    const bottomRow: NavLink[] = [
        { href: '/shop', labelKey: 'navShop' },
        { href: '/accessories', labelKey: 'navAccessories' },
        { href: '/brew-guide', labelKey: 'navBrewGuide' },
        { href: '/blog', labelKey: 'navBlog' },
    ];

    const navLinkClass = (href: string) =>
        `flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors text-[10px] font-bold tracking-[0.15em] uppercase ${pathname === href ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white'
        }`;

    return (
        <>
            <header className="bg-sb-green text-white relative z-[9999] pt-2 pb-[30px] -mb-[30px]">
                <div className="max-w-[1600px] mx-auto w-full flex border-b border-white/20 relative z-[9999]">

                    {/* ── Mobile Menu Toggle ────────────────────────────── */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="xl:hidden p-4 lg:p-5 flex items-center justify-center border-r border-white/20 hover:bg-white/10 transition-colors flex-shrink-0"
                        aria-label="Open menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    </button>

                    {/* ── Logo ──────────────────────────────────────────── */}
                    <div className="flex-1 xl:flex-none flex items-center justify-center xl:justify-start xl:w-[260px] p-4 lg:p-5 border-r border-white/20 hover:bg-white/5 transition-colors">
                        <Link href="/" className="flex flex-col text-center xl:text-left">
                            <h1 className="font-display text-xl lg:text-2xl tracking-tight uppercase leading-none">
                                {AppConfig.brand.name}
                                <br />
                                <span className="text-[9px] lg:text-xs font-sans font-bold tracking-[0.2em] opacity-80 mt-1 block">
                                    {t('brandTagline')}
                                </span>
                            </h1>
                        </Link>
                    </div>

                    {/* ── Desktop Navigation ────────────────────────────── */}
                    <div className="hidden xl:flex flex-1 flex-col min-w-0">
                        {/* Top row */}
                        <div className="flex border-b border-white/20">
                            {topRow.map(link => (
                                <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                                    {t(link.labelKey as Parameters<typeof t>[0])}
                                </Link>
                            ))}
                        </div>
                        {/* Bottom row */}
                        <div className="flex relative">
                            {bottomRow.map(link => (
                                <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                                    {t(link.labelKey as Parameters<typeof t>[0])}
                                </Link>
                            ))}

                            {/* Language Toggle Desktop */}
                            <div className="flex items-center justify-center px-5 border-l border-white/20">
                                <LanguageToggle />
                            </div>
                        </div>
                    </div>

                    {/* ── Right Icons ───────────────────────────────────── */}
                    <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 border-l-0 xl:border-l border-white/20 relative z-[100] pointer-events-auto">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white"
                            aria-label="Search"
                        >
                            <Search size={16} />
                        </button>

                        <button
                            onClick={() => isAuthenticated ? router.push('/account') : openLoginModal()}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
                            aria-label="Account"
                        >
                            <User size={16} />
                            {isAuthenticated && (
                                <span className="text-[11px] font-bold tracking-wide hidden sm:block max-w-[80px] truncate">
                                    Hi, {user?.name?.split(' ')[0] || 'User'}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setCartOpen(true)}
                            className="w-9 h-9 bg-white rounded-full flex items-center justify-center relative shadow-sm hover:shadow-md transition-shadow"
                            aria-label="Open cart"
                        >
                            <ShoppingBag size={14} className="text-sb-black" />
                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-sb-black text-white text-[8px] flex items-center justify-center font-black shadow-sm"
                                    >
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Mobile Navigation Drawer ─────────────────────────── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100000] bg-sb-green flex flex-col xl:hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/20">
                            <h1 className="font-display text-xl uppercase tracking-tight text-white">Menu</h1>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-10 h-10 flex items-center justify-center text-white bg-white/10 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
                            <div className="flex flex-col gap-4">
                                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Discover</p>
                                {topRow.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`font-display text-3xl uppercase tracking-tight ${pathname === link.href ? 'text-white' : 'text-white/70 hover:text-white'}`}
                                    >
                                        {t(link.labelKey as Parameters<typeof t>[0])}
                                    </Link>
                                ))}
                            </div>

                            <div className="flex flex-col gap-4">
                                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Shop</p>
                                {bottomRow.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`font-display text-3xl uppercase tracking-tight ${pathname === link.href ? 'text-white' : 'text-white/70 hover:text-white'}`}
                                    >
                                        {t(link.labelKey as Parameters<typeof t>[0])}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/20 flex flex-col gap-4">
                            <div className="flex justify-between items-center relative z-[200]">
                                <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Language</span>
                                <LanguageToggle direction="up" />
                            </div>

                            {!isAuthenticated ? (
                                <button
                                    onClick={() => { setMobileMenuOpen(false); openLoginModal(); }}
                                    className="w-full py-4 bg-white text-sb-green rounded-full font-bold uppercase tracking-widest text-xs"
                                >
                                    Login / Register
                                </button>
                            ) : (
                                <Link
                                    href="/account"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full py-4 border border-white/30 text-white rounded-full font-bold uppercase tracking-widest text-xs text-center"
                                >
                                    My Account
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Global Search Overlay ──────────────────────────────── */}
            <AnimatePresence>
                {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
            </AnimatePresence>

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}
