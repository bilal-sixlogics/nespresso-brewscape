"use client";

import React, { useState } from 'react';
import Link from '@/components/LocaleLink';
import { Coffee, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { FacebookIcon, InstagramIcon, LinkedinIcon } from '@/components/icons/SocialIcons';
import { AppConfig } from '@/lib/config';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { TrustIndicators } from '@/components/ui/TrustIndicators';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { Endpoints } from '@/lib/api/endpoints';
import { TestimonialsSection } from '@/components/ui/TestimonialsSection';
import { CupSeparator } from '@/components/ui/CupSeparator';
const SOCIALS = [
    { name: 'Facebook', icon: FacebookIcon, key: 'social_facebook_url' as const },
    { name: 'Instagram', icon: InstagramIcon, key: 'social_instagram_url' as const },
    { name: 'TikTok', icon: TikTokIcon, key: 'social_tiktok_url' as const },
    { name: 'LinkedIn', icon: LinkedinIcon, key: 'social_linkedin_url' as const },
];

/**
 * Sitewide links into the B2B / wholesale cluster.
 *
 * This block is the main reason those pages are reachable at all: a footer
 * link appears on every indexed URL, which is what gives a new landing page a
 * crawl path and a share of internal authority instead of leaving it to be
 * found in the sitemap alone.
 *
 * Locale-aware because the pages are not all published in five languages. The
 * four local-intent pages are French-only and /professionnels is French and
 * English, so linking them unconditionally would put 404s in the footer of
 * every German, Russian and Dutch page. For those three, the English B2B page
 * is linked explicitly (`/en/...` is already locale-prefixed, so LocaleLink
 * passes it through untouched) rather than dropping the link entirely.
 */
function proLinks(
    language: string,
    /** Already-translated label used for the de/ru/nl fallback link. */
    fallbackLabel: string,
): { href: string; label: string }[] {
    if (language === 'fr') {
        return [
            { href: '/professionnels', label: 'Grossiste café professionnel' },
            { href: '/grossiste-cafe-paris', label: 'Grossiste café Paris' },
            { href: '/grossiste-cafe-ile-de-france', label: 'Grossiste café Île-de-France' },
            { href: '/grossiste-machines-a-cafe', label: 'Grossiste machines à café' },
            { href: '/machine-a-cafe-professionnelle', label: 'Machine à café professionnelle' },
            { href: '/marques', label: 'Marques de café' },
        ];
    }
    if (language === 'en') {
        return [
            { href: '/professionnels', label: 'Coffee wholesale for business' },
            { href: '/marques', label: 'Coffee brands' },
        ];
    }
    // de / ru / nl: no translated B2B pages, so point at the English one.
    return [{ href: '/en/professionnels', label: fallbackLabel }];
}

export function Footer() {
    const { t, language } = useLanguage();
    const siteSettings = useSiteSettings();
    const [nlEmail, setNlEmail] = useState('');
    const [nlState, setNlState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [nlError, setNlError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        if (!nlEmail.trim() || !nlEmail.includes('@')) return;
        setNlState('loading');
        setNlError(null);
        try {
            await apiClient.post(Endpoints.newsletter, { email: nlEmail.trim() });
            setNlState('success');
            setNlEmail('');
            setTimeout(() => setNlState('idle'), 4000);
        } catch (err) {
            const apiErr = err as ApiError;
            setNlError(apiErr.message ?? t('subscriptionFailedMsg'));
            setNlState('error');
        }
    };

    return (
        <footer className="bg-ink text-sand relative z-20 pt-40 px-4 pb-10 grain-overlay">
            
            <TestimonialsSection />
            
            <div className="max-w-[1400px] mx-auto relative z-10">

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-20">

                    {/* Brand */}
                    <div className="space-y-8">
                        {/* Brand mark, not a heading. This was an <h1>, which put a
                            second "Cafrezzo" H1 on every page — and on client-rendered
                            routes it was the ONLY H1 in the server HTML, so crawlers
                            read every page's primary heading as "Cafrezzo". Identical
                            classes, so the rendered appearance is unchanged. */}
                        <div className="font-display text-2xl lg:text-3xl tracking-tight uppercase leading-none">
                            {AppConfig.brand.name}
                            <br />
                            <span className="text-base font-sans font-bold tracking-[0.2em] opacity-80 mt-1 block">{t('brandTagline')}</span>
                        </div>
                        {/* <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            {t('brandDescription')}
                        </p> */}
                        <div className="flex space-x-3">
                            {SOCIALS.filter((social) => siteSettings[social.key]?.trim()).map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={siteSettings[social.key]}
                                        aria-label={social.name}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        className="w-11 h-11 bg-sand/5 hover:bg-gold border border-sand/10 hover:border-gold rounded-full flex items-center justify-center text-cocoa hover:text-ink transition-all duration-300 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
                                    >
                                        <Icon size={16} strokeWidth={2} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h2 className="font-bold text-xs tracking-[0.2em] uppercase mb-8 text-sand">{t('quickLinks')}</h2>
                        <ul className="space-y-4 flex flex-col items-start">
                            <li><Link href="/" className="text-cocoa hover:text-gold transition-colors text-sm">{t('navHome')}</Link></li>
                            <li><Link href="/machines" className="text-cocoa hover:text-gold transition-colors text-sm">{t('navMachines')}</Link></li>
                            <li><Link href="/brew-guide" className="text-cocoa hover:text-gold transition-colors text-sm">{t('navBrewGuide')}</Link></li>
                            <li><Link href="/shop" className="text-cocoa hover:text-gold transition-colors text-sm">{t('navShop')}</Link></li>
                            <li><Link href="/sweets" className="text-cocoa hover:text-gold transition-colors text-sm">{t('navSweets')}</Link></li>
                            <li><Link href="/our-origins" className="text-cocoa hover:text-gold transition-colors text-sm">{t('navOrigins')}</Link></li>
                            <li><Link href="/journal" className="text-cocoa hover:text-gold transition-colors text-sm">{t('navBlog')}</Link></li>

                            {/* Professionals / wholesale cluster.
                                Replaces the single generic "/wholesale" entry
                                that used to sit here and pointed at a page with
                                no <h1> and no commercial copy.

                                Kept inside this existing column rather than
                                given a new one: the footer grid is four columns
                                wide and a fifth would push the newsletter card
                                onto its own row, which is a layout change this
                                task has no mandate to make.

                                Anchor text is descriptive on purpose — the
                                anchor is one of the few signals that tells
                                Google what the *target* page is about, so
                                "Grossiste café Paris" is worth considerably
                                more here than a generic "Professionnels". */}
                            {proLinks(language, t('navWholesale')).map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-cocoa hover:text-gold transition-colors text-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h2 className="font-bold text-xs tracking-[0.2em] uppercase mb-8 text-sand">{t('support')}</h2>
                        <ul className="space-y-4">
                            <li><Link href="/contact" className="text-cocoa hover:text-gold transition-colors text-sm">{t('footerContact')}</Link></li>
                            <li><Link href="/orders/track" className="text-cocoa hover:text-gold transition-colors text-sm">{t('footerTrackOrder')}</Link></li>
                            <li><Link href="/faq" className="text-cocoa hover:text-gold transition-colors text-sm">{t('footerFaq')}</Link></li>
                            <li><Link href="/shipping" className="text-cocoa hover:text-gold transition-colors text-sm">{t('footerShipping')}</Link></li>
                            <li><Link href="/privacy" className="text-cocoa hover:text-gold transition-colors text-sm">{t('footerPrivacy')}</Link></li>
                            <li><Link href="/terms" className="text-cocoa hover:text-gold transition-colors text-sm">{t('footerTerms')}</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter — beige banner per brand guidelines */}
                    <div>
                        <div className="bg-sand rounded-[32px] p-6 sm:p-7 text-ink">
                            <h2 className="font-bold text-xs tracking-[0.2em] uppercase mb-6 text-ink">{t('stayConnected')}</h2>
                            <p className="text-ink/60 text-sm leading-relaxed mb-6">{t('subscribeHero')}</p>
                            {nlState === 'success' ? (
                                <div className="flex items-center gap-3 bg-gold/15 border border-gold/30 rounded-full px-5 py-3">
                                    <CheckCircle2 size={16} className="text-ink" />
                                    <span className="text-sm font-bold text-ink">{t('footerSubscribed')}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex">
                                        <label htmlFor="footer-newsletter-email" className="sr-only">{t('emailPlaceholder')}</label>
                                        <input
                                            id="footer-newsletter-email"
                                            type="email"
                                            value={nlEmail}
                                            onChange={e => { setNlEmail(e.target.value); if (nlState === 'error') setNlState('idle'); }}
                                            onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                                            placeholder={t('emailPlaceholder')}
                                            className="flex-1 min-w-0 w-full bg-ink/5 border border-ink/10 rounded-l-full px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold transition-colors"
                                            disabled={nlState === 'loading'}
                                        />
                                        <button
                                            onClick={handleSubscribe}
                                            disabled={nlState === 'loading'}
                                            className="bg-gold hover:bg-[#b8914d] text-ink px-6 py-3 rounded-r-full text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 disabled:opacity-60"
                                        >
                                            {nlState === 'loading' ? <Loader2 size={14} className="animate-spin" /> : t('join')}
                                        </button>
                                    </div>
                                    {nlState === 'error' && nlError && (
                                        <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                                            <AlertCircle size={12} className="shrink-0" />
                                            <span>{nlError}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="mt-6">
                            <TrustIndicators
                                variant="compact"
                                items={[{ icon: Coffee, title: t('freeShipping'), description: t('freeShippingDesc') }]}
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-sand/10 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-cocoa/70 text-xs tracking-widest uppercase">© {AppConfig.brand.copyrightYear} {AppConfig.brand.name}. {t('copyright')}</p>
                    <div className="flex space-x-8 mt-4 md:mt-0">
                        <Link href="/privacy" className="text-cocoa/70 hover:text-gold text-xs tracking-widest uppercase transition-colors">{t('privacy')}</Link>
                        <Link href="/terms" className="text-cocoa/70 hover:text-gold text-xs tracking-widest uppercase transition-colors">{t('terms')}</Link>
                        <Link href="/privacy#cookies" className="text-cocoa/70 hover:text-gold text-xs tracking-widest uppercase transition-colors">{t('cookies')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
