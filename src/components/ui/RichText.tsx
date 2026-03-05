"use client";

import React from 'react';

/**
 * RichText – renders a lightweight Markdown-like string as styled JSX.
 *
 * ── WHAT THE BACKEND / ADMIN PANEL SHOULD SEND ─────────────────────────────
 *
 * The `desc` / `descEn` field accepts a plain string with optional Markdown-like
 * syntax. The admin just types normal text; the frontend handles styling.
 *
 * Supported syntax:
 *   ## Heading              → green uppercase section header
 *   ### Sub-heading         → smaller bold header
 *   - [x] text             → green ✓ checkmark bullet (for feature lists)
 *   - text                 → standard bullet with green dot
 *   **bold**               → bold inline text
 *   ---                    → horizontal divider
 *   (blank line)           → paragraph break
 *
 * Example value the admin/backend would send for `desc`:
 * ─────────────────────────────────────────────────────
 *   Un café en grains d'exception, soigneusement sélectionné.
 *
 *   ## Caractéristiques
 *   - [x] Torréfaction artisanale
 *   - [x] 100 % Arabica d'Éthiopie
 *   - [x] Certifié biologique
 *
 *   ## Conseils de préparation
 *   - Mouture **moyennement fine**
 *   - Eau entre 90 et 95 °C
 *
 *   ---
 *   Idéal pour espresso, lungo et cappuccino.
 * ─────────────────────────────────────────────────────
 *
 * Props:
 *   content  – the raw string from the product data
 *   size     – 'card' (compact) | 'panel' (medium) | 'page' (full, default)
 */

interface RichTextProps {
    content: string;
    size?: 'card' | 'panel' | 'page';
}

function parseInline(text: string): React.ReactNode[] {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-sb-black">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

export function RichText({ content, size = 'page' }: RichTextProps) {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let paragraphBuffer: string[] = [];

    const flushParagraph = () => {
        const text = paragraphBuffer.join(' ').trim();
        if (text) {
            elements.push(
                <p key={`p-${elements.length}`}
                    className={`text-gray-500 leading-relaxed ${size === 'page' ? 'text-base' : size === 'panel' ? 'text-sm' : 'text-xs'}`}>
                    {parseInline(text)}
                </p>
            );
        }
        paragraphBuffer = [];
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Blank line — flush paragraph
        if (trimmed === '') {
            flushParagraph();
            continue;
        }

        // Horizontal rule
        if (trimmed === '---') {
            flushParagraph();
            elements.push(<hr key={`hr-${i}`} className="border-gray-100 my-3" />);
            continue;
        }

        // ## Heading
        if (trimmed.startsWith('## ')) {
            flushParagraph();
            const text = trimmed.slice(3);
            elements.push(
                <h3 key={`h2-${i}`}
                    className={`font-bold uppercase tracking-widest text-sb-black mt-4 mb-2 ${size === 'page' ? 'text-sm' : 'text-[10px]'}`}>
                    {text}
                </h3>
            );
            continue;
        }

        // ### Sub-heading
        if (trimmed.startsWith('### ')) {
            flushParagraph();
            const text = trimmed.slice(4);
            elements.push(
                <h4 key={`h3-${i}`}
                    className={`font-semibold text-sb-black mt-3 mb-1 ${size === 'page' ? 'text-sm' : 'text-xs'}`}>
                    {text}
                </h4>
            );
            continue;
        }

        // - [x] Checkmark bullet (feature / benefit)
        if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
            flushParagraph();
            const text = trimmed.slice(6);
            elements.push(
                <div key={`chk-${i}`} className="flex items-start gap-2.5 my-1">
                    <span className={`shrink-0 flex items-center justify-center rounded-full bg-sb-green/10 text-sb-green font-black ${size === 'page' ? 'w-5 h-5 text-[10px] mt-0.5' : 'w-4 h-4 text-[9px] mt-0.5'}`}>
                        ✓
                    </span>
                    <span className={`text-gray-600 leading-snug ${size === 'page' ? 'text-sm' : 'text-xs'}`}>
                        {parseInline(text)}
                    </span>
                </div>
            );
            continue;
        }

        // - Standard bullet
        if (trimmed.startsWith('- ')) {
            flushParagraph();
            const text = trimmed.slice(2);
            elements.push(
                <div key={`ul-${i}`} className="flex items-start gap-2.5 my-0.5">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-sb-green mt-2" />
                    <span className={`text-gray-500 leading-snug ${size === 'page' ? 'text-sm' : 'text-xs'}`}>
                        {parseInline(text)}
                    </span>
                </div>
            );
            continue;
        }

        // Regular text — accumulate into paragraph
        paragraphBuffer.push(trimmed);
    }

    // Flush any remaining paragraph
    flushParagraph();

    if (elements.length === 0) return null;

    return <div className="space-y-1">{elements}</div>;
}
