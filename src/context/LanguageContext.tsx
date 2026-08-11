"use client";

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { translations, TranslationKey } from '@/lib/translations';
import {
    DEFAULT_LOCALE,
    LOCALE_META,
    SUPPORTED_LOCALES,
    localePath,
    stripLocale,
    type Locale,
    type LocaleMeta,
} from '@/lib/i18n';

// Re-exported for the many components that already import these from here.
export type Language = Locale;
export type { LocaleMeta as LanguageMeta };
export const SUPPORTED_LANGUAGES = SUPPORTED_LOCALES;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    currentLanguageMeta: LocaleMeta;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Language state, driven by the URL.
 *
 * Previously the locale lived in localStorage, which meant all five languages
 * shared one set of URLs — so only French could ever be indexed and the other
 * four were invisible to search engines and AI crawlers. The locale now comes
 * from the `[locale]` route segment, supplied by the server layout, so every
 * language has its own crawlable URL and the server renders the correct
 * language in the initial HTML.
 *
 * Switching language is a navigation, not a state update.
 */
export function LanguageProvider({
    children,
    locale,
}: {
    children: ReactNode;
    /** Supplied by app/[locale]/layout.tsx. */
    locale: Locale;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const setLanguage = useCallback(
        (lang: Language) => {
            // Navigate to the same page under the new locale prefix.
            const bare = stripLocale(pathname || '/');
            // Remembered only so a future visit to a bare URL can be sent to the
            // right locale; the URL, not this value, is the source of truth.
            try {
                document.cookie = `cafrezzo-locale=${lang};path=/;max-age=31536000;samesite=lax`;
            } catch { /* ignore */ }
            router.push(localePath(lang, bare));
        },
        [pathname, router],
    );

    const t = useCallback(
        (key: TranslationKey): string => {
            const dict = translations[locale] as Record<string, string> | undefined;
            const fallback = translations[DEFAULT_LOCALE] as Record<string, string>;
            return dict?.[key] ?? fallback?.[key] ?? key;
        },
        [locale],
    );

    const currentLanguageMeta = LOCALE_META[locale];

    return (
        <LanguageContext.Provider
            value={{ language: locale, setLanguage, t, currentLanguageMeta }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
