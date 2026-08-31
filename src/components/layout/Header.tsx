"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from '@/components/LocaleLink';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, ChevronDown, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/store/CartContext';
import { useAuth } from '@/context/AuthContext';
import { AppConfig } from '@/lib/config';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '@/context/LanguageContext';
import { localeFromPathname, localePath } from '@/lib/i18n';
import { FlagIcon } from '@/components/ui/FlagIcon';
import { useFormatPrice } from '@/context/SiteSettingsContext';
import { useProducts } from '@/hooks/useProducts';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { Product, getProductImage, getDisplayPrice, getDefaultUnit } from '@/types';

// ─── Type ─────────────────────────────────────────────────────────────────
interface NavLink { href: string; labelKey: string; active?: boolean }

// ─── Search ───────────────────────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
    const { t } = useLanguage();
    const formatPrice = useFormatPrice();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Only fetch when query is non-empty (2+ chars)
    const { products: searchResults, isLoading: searchLoading } = useProducts(
        query.length > 1 ? { search: query, per_page: 8 } : { per_page: 0 }
    );

    useEffect(() => { inputRef.current?.focus(); }, []);

    // Portals require a DOM node — only available once mounted on the client.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const results: Product[] = query.length > 1 ? searchResults : [];

    if (!mounted) return null;

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[30000] bg-ink/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-2xl bg-sand rounded-[32px] overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Input */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-ink/10">
                    <Search size={18} className="text-ink/40 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="flex-1 text-base text-ink placeholder-ink/30 outline-none bg-transparent"
                    />
                    <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto p-4">
                    {query.length > 1 && searchLoading && (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-ink/15 border-t-gold rounded-full animate-spin" />
                        </div>
                    )}
                    {query.length > 1 && !searchLoading && results.length === 0 && (
                        <p className="text-center text-ink/50 text-sm py-8">{t('noResults')}</p>
                    )}
                    {results.length > 0 && (
                        <div>
                            <p className="text-[9px] font-black tracking-[0.2em] uppercase text-ink/50 mb-3 px-2">
                                {t('searchProducts')}
                            </p>
                            <div className="grid grid-cols-1 gap-1">
                                {results.map(p => (
                                    <Link
                                        key={p.id}
                                        href={`/shop/${p.slug ?? p.id}`}
                                        onClick={onClose}
                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-ink/5 transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-ink/10">
                                            <img src={getProductImage(p) ?? ''} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-ink truncate">{p.name}</p>
                                            {getDefaultUnit(p)?.name && <p className="text-[10px] text-ink/50">{getDefaultUnit(p)?.name}</p>}
                                        </div>
                                        <span className="text-sm font-bold text-gold flex-shrink-0">
                                            {formatPrice(getDisplayPrice(p))}
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
                                    className="flex items-center gap-3 p-4 bg-ink/5 hover:bg-ink/10 rounded-2xl transition-colors"
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/70">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>,
        document.body
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
                className="flex items-center gap-1.5 bg-sand/10 hover:bg-sand/20 border border-sand/20 rounded-full px-3 py-1.5 transition-all duration-200 group"
            >
                <FlagIcon code={currentLanguageMeta.code} className="w-5 h-3.5" />
                <span className="text-[10px] font-black tracking-[0.1em] text-sand">
                    {currentLanguageMeta.label}
                </span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={10} className="text-sand/60" />
                </motion.div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: direction === 'down' ? 6 : -6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: direction === 'down' ? 4 : -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${direction === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'} right-0 bg-sand rounded-2xl shadow-xl border border-ink/10 overflow-hidden min-w-[150px] z-50`}
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => { setLanguage(lang.code as Language); setOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-ink/5 transition-colors ${language === lang.code ? 'bg-gold/10' : ''
                                    }`}
                            >
                                <FlagIcon code={lang.code} className="w-5 h-3.5" />
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-ink">{lang.nativeName}</span>
                                </div>
                                {language === lang.code && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-gold" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Nav links (static — defined outside component to avoid re-creation per render) ─
const TOP_NAV: NavLink[] = [
    { href: '/', labelKey: 'navHome' },
    { href: '/shop', labelKey: 'navShop' },
    { href: '/machines', labelKey: 'navMachines' },
    { href: '/sweets', labelKey: 'navSweets' },
];

const BOTTOM_NAV: NavLink[] = [
    { href: '/accessories', labelKey: 'navAccessories' },
    // { href: '/brew-guide', labelKey: 'navBrewGuide' },
    // { href: '/journal', labelKey: 'navBlog' },
    { href: '/contact', labelKey: 'navContact' },
];

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
    // Portals require a DOM node — only available once mounted on the client.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Close mobile menu on route change — intentional side-effect, not a cascade
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMobileMenuOpen(false);
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

    const topRow = TOP_NAV;
    const bottomRow = BOTTOM_NAV;

    const navLinkClass = (href: string) =>
        `flex-1 p-3 lg:p-4 flex items-center justify-center border-r border-sand/10 transition-all duration-300 text-[10px] font-medium tracking-[0.22em] uppercase relative group ${pathname === href
            ? 'bg-sand/12 text-sand after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-gold after:rounded-full'
            : 'text-sand/60 hover:text-sand hover:bg-sand/8'
        }`;

    return (
        <>
            <header className="bg-ink text-sand relative z-[9999]">
                <div className="max-w-[1600px] mx-auto w-full flex border-b border-sand/10 relative z-[9999]">

                    {/* ── Mobile Menu Toggle ────────────────────────────── */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="xl:hidden p-4 lg:p-5 flex items-center justify-center border-r border-sand/15 hover:bg-sand/10 transition-colors flex-shrink-0"
                        aria-label={t('ariaOpenMenu')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    </button>

                    {/* ── Logo ──────────────────────────────────────────── */}
                    <div className="flex-1 xl:flex-none flex items-center justify-center xl:justify-start xl:w-[260px] p-4 lg:p-5 border-r border-sand/10 hover:bg-sand/5 transition-colors">
                        <Link href="/" className="flex flex-col items-center xl:items-start gap-1.5">
                            <img src="/assets/logo.svg" alt={AppConfig.brand.name} className="h-6 lg:h-7  brightness-200" />
                            <span className="text-[8px] lg:text-[9px] font-sans font-medium tracking-[0.25em] uppercase text-sand/60">
                                {t('brandTagline')} 
                            </span>
                        </Link>
                    </div>

                    {/* ── Desktop Navigation ────────────────────────────── */}
                    <div className="hidden xl:flex flex-1 flex-col min-w-0">
                        {/* Top row */}
                        <div className="flex border-b border-sand/10">
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
                            <div className="flex items-center justify-center px-5 border-l border-sand/15">
                                <LanguageToggle />
                            </div>
                        </div>
                    </div>

                    {/* ── Right Icons ───────────────────────────────────── */}
                    <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 border-l-0 xl:border-l border-sand/15 relative z-[100] pointer-events-auto">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-sand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold transition-colors text-sand"
                            aria-label={t('ariaSearch')}
                        >
                            <Search size={16} />
                        </button>

                        <button
                            onClick={() => isAuthenticated ? router.push(localePath(localeFromPathname(pathname || '/'), '/account')) : openLoginModal()}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 px-2 rounded-full hover:bg-sand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold transition-colors text-sand"
                            aria-label={t('ariaAccount')}
                        >
                            <User size={16} />
                            {isAuthenticated && (
                                <span className="text-[11px] font-bold tracking-wide hidden sm:block max-w-[80px] truncate">
                                    {t('hiGreeting')}, {user?.name?.split(' ')[0] || t('defaultUserNameHeader')}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setCartOpen(true)}
                            className="min-h-[44px] min-w-[44px] bg-gold rounded-full flex items-center justify-center relative shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold transition-shadow"
                            aria-label={t('ariaOpenCart')}
                        >
                            <ShoppingBag size={14} className="text-ink" />
                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ink text-gold text-[8px] flex items-center justify-center font-black shadow-sm border border-gold/40"
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
            {mounted && createPortal(
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            role="dialog"
                            aria-modal="true"
                            aria-label={t('ariaNavigationMenu')}
                            className="fixed inset-0 z-[100000] bg-ink flex flex-col xl:hidden grain-overlay"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-sand/15">
                                <h1 className="font-display text-xl uppercase tracking-tight text-sand">{t('menuHeading')}</h1>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    aria-label={t('ariaCloseMenu')}
                                    className="w-11 h-11 flex items-center justify-center text-sand bg-sand/10 rounded-full hover:bg-sand/20 transition-colors focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
                                <div className="flex flex-col gap-5">
                                    <p className="text-[9px] uppercase tracking-[0.25em] text-cocoa font-medium">{t('discoverLabel')}</p>
                                    {topRow.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`font-display text-3xl uppercase tracking-tight transition-colors duration-300 ${pathname === link.href ? 'text-gold' : 'text-sand/50 hover:text-sand'}`}
                                        >
                                            {t(link.labelKey as Parameters<typeof t>[0])}
                                        </Link>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-5">
                                    <p className="text-[9px] uppercase tracking-[0.25em] text-cocoa font-medium">{t('shopLabel')}</p>
                                    {bottomRow.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`font-display text-3xl uppercase tracking-tight transition-colors duration-300 ${pathname === link.href ? 'text-gold' : 'text-sand/50 hover:text-sand'}`}
                                        >
                                            {t(link.labelKey as Parameters<typeof t>[0])}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 border-t border-sand/15 flex flex-col gap-4">
                                <div className="flex justify-between items-center relative z-[200]">
                                    <span className="text-[10px] uppercase tracking-widest text-sand/50 font-bold">{t('languageLabel')}</span>
                                    <LanguageToggle direction="up" />
                                </div>

                                {!isAuthenticated ? (
                                    <button
                                        onClick={() => { setMobileMenuOpen(false); openLoginModal(); }}
                                        className="w-full py-4 bg-gold text-ink rounded-full font-bold uppercase tracking-widest text-xs"
                                    >
                                        {t('loginRegisterBtn')}
                                    </button>
                                ) : (
                                    <Link
                                        href="/account"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-4 border border-sand/30 text-sand rounded-full font-bold uppercase tracking-widest text-xs text-center"
                                    >
                                        {t('myAccountLink')}
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* ── Global Search Overlay ──────────────────────────────── */}
            <AnimatePresence>
                {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
            </AnimatePresence>

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}
