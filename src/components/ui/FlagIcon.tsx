"use client";

import type { Language } from '@/context/LanguageContext';

// Inline SVG flags — avoids relying on emoji flag glyphs, which many
// browsers/OSes (notably Windows Chrome/Edge without an emoji flag font)
// render as literal two-letter fallback text (e.g. 🇬🇧 → "GB").
const FLAGS: Record<Language, React.ReactNode> = {
    fr: (
        <svg viewBox="0 0 3 2" className="w-full h-full">
            <rect width="1" height="2" x="0" fill="#0055A4" />
            <rect width="1" height="2" x="1" fill="#FFFFFF" />
            <rect width="1" height="2" x="2" fill="#EF4135" />
        </svg>
    ),
    en: (
        <svg viewBox="0 0 60 30" className="w-full h-full">
            <clipPath id="fi-en-clip"><rect width="60" height="30" /></clipPath>
            <g clipPath="url(#fi-en-clip)">
                <rect width="60" height="30" fill="#012169" />
                <path d="M0,0 60,30 M60,0 0,30" stroke="#FFFFFF" strokeWidth="6" />
                <path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" strokeWidth="2" />
                <path d="M30,0 30,30 M0,15 60,15" stroke="#FFFFFF" strokeWidth="10" />
                <path d="M30,0 30,30 M0,15 60,15" stroke="#C8102E" strokeWidth="6" />
            </g>
        </svg>
    ),
    de: (
        <svg viewBox="0 0 3 2" className="w-full h-full">
            <rect width="3" height="2" y="0" fill="#000000" />
            <rect width="3" height="1.333" y="0.667" fill="#DD0000" />
            <rect width="3" height="0.667" y="1.333" fill="#FFCE00" />
        </svg>
    ),
    ru: (
        <svg viewBox="0 0 3 2" className="w-full h-full">
            <rect width="3" height="2" y="0" fill="#FFFFFF" />
            <rect width="3" height="1.333" y="0.667" fill="#0039A6" />
            <rect width="3" height="0.667" y="1.333" fill="#D52B1E" />
        </svg>
    ),
    nl: (
        <svg viewBox="0 0 3 2" className="w-full h-full">
            <rect width="3" height="2" y="0" fill="#21468B" />
            <rect width="3" height="1.333" y="0" fill="#FFFFFF" />
            <rect width="3" height="0.667" y="0" fill="#AE1C28" />
        </svg>
    ),
};

export function FlagIcon({ code, className = 'w-5 h-3.5' }: { code: Language; className?: string }) {
    return (
        <span className={`inline-block overflow-hidden rounded-[2px] shrink-0 ${className}`}>
            {FLAGS[code]}
        </span>
    );
}
