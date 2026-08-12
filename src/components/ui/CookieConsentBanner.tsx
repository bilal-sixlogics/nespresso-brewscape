"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

import Link from '@/components/LocaleLink';
import { useConsent } from '@/context/ConsentContext';
import { CONSENT_COPY } from '@/lib/consent-copy';
import { localeFromPathname } from '@/lib/i18n';

/**
 * Cookie consent banner.
 *
 * Shown only while the decision is still 'unknown'. Accept and Reject are
 * given equal visual weight — CNIL guidance is explicit that refusing must be
 * as easy as accepting, so a prominent Accept beside a muted link would not
 * be compliant.
 */
export function CookieConsentBanner() {
    const { consent, setConsent } = useConsent();
    const pathname = usePathname();
    const locale = localeFromPathname(pathname || '/');
    const copy = CONSENT_COPY[locale];

    return (
        <AnimatePresence>
            {consent === 'unknown' && (
                <motion.div
                    role="dialog"
                    aria-label={copy.ariaLabel}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed bottom-0 left-0 right-0 z-[40000] bg-ink border-t border-sand/15 px-4 py-4 sm:px-6"
                >
                    <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
                        <p className="text-sand/80 text-xs sm:text-sm leading-relaxed flex-1">
                            {copy.message}{' '}
                            <Link
                                href="/privacy#cookies"
                                className="text-gold underline underline-offset-2 hover:text-sand transition-colors"
                            >
                                {copy.learnMore}
                            </Link>
                        </p>
                        <div className="flex gap-3 flex-shrink-0">
                            <button
                                onClick={() => setConsent('denied')}
                                className="min-h-[44px] px-6 rounded-full border border-sand/30 text-sand text-xs font-bold tracking-widest uppercase hover:bg-sand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold transition-colors"
                            >
                                {copy.reject}
                            </button>
                            <button
                                onClick={() => setConsent('granted')}
                                className="min-h-[44px] px-6 rounded-full bg-gold text-ink text-xs font-bold tracking-widest uppercase hover:bg-[#b8914d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold transition-colors"
                            >
                                {copy.accept}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
