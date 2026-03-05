"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, TranslationKey } from '@/lib/translations';

// ─── Language Definitions ─────────────────────────────────────────────────
// To add a new language: add its code here, add its flag/label, and add a
// translations block in translations.ts.
export type Language = 'fr' | 'en' | 'de' | 'ru' | 'nl';

export interface LanguageMeta {
    code: Language;
    label: string;   // Short label used in the toggle
    flag: string;    // Emoji flag
    nativeName: string; // Native name
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
    { code: 'fr', label: 'FR', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'en', label: 'EN', flag: '🇬🇧', nativeName: 'English' },
    { code: 'de', label: 'DE', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'ru', label: 'RU', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'nl', label: 'NL', flag: '🇳🇱', nativeName: 'Nederlands' },
];

// ─── Context ─────────────────────────────────────────────────────────────

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    currentLanguageMeta: LanguageMeta;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('fr'); // French is default

    useEffect(() => {
        // Restore persisted preference on mount
        try {
            const saved = localStorage.getItem('cafrezzo-language') as Language;
            const isSupported = SUPPORTED_LANGUAGES.some(l => l.code === saved);
            if (saved && isSupported) {
                setLanguageState(saved);
                document.documentElement.lang = saved;
            }
        } catch {
            // localStorage may not be available in SSR
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        try {
            localStorage.setItem('cafrezzo-language', lang);
        } catch { /* ignore */ }
        document.documentElement.lang = lang;
    };

    const t = (key: TranslationKey): string => {
        const langDict = translations[language] as Record<string, string>;
        const frDict = translations['fr'] as Record<string, string>;
        return langDict?.[key] ?? frDict?.[key] ?? key;
    };

    const currentLanguageMeta = SUPPORTED_LANGUAGES.find(l => l.code === language)!;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguageMeta }}>
            {children}
        </LanguageContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
