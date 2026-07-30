"use client";

import { motion } from 'framer-motion';
import { marked } from 'marked';
import { useMemo } from 'react';
import { ProductSection } from '@/types/dynamic-product';

// ── Markdown → safe HTML ──────────────────────────────────────────────────────
function useMarkdownHtml(md: string): string {
    return useMemo(() => {
        if (!md) return '';
        // marked.parse returns string (sync when no async extensions)
        const html = marked.parse(md, { async: false }) as string;
        return html;
    }, [md]);
}

// ── Taste profile bar ─────────────────────────────────────────────────────────
function TasteBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cocoa w-24 flex-shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-sand/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / max) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full"
                />
            </div>
            <span className="text-xs text-cocoa font-bold w-4 text-right">{value}</span>
        </div>
    );
}

// ── Rich text renderer ────────────────────────────────────────────────────────
function RichTextBody({ html }: { html: string }) {
    return (
        <div
            className="prose prose-sm prose-invert max-w-none text-sand/70 prose-headings:font-display prose-headings:uppercase prose-headings:text-sand prose-strong:text-sand prose-a:text-gold prose-blockquote:border-gold prose-li:marker:text-gold"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

// ── Main renderer — one switch per section type ───────────────────────────────
export function SectionRenderer({ section }: { section: ProductSection }) {
    switch (section.type) {

        case 'intensity':
            return (
                <div className="bg-sand/8 rounded-3xl p-6 border border-sand/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cocoa mb-3">Intensity</p>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-sand/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(section.value / (section.max ?? 13)) * 100}%` }}
                                transition={{ duration: 0.9 }}
                                className="h-full bg-gradient-to-r from-gold/50 to-gold rounded-full"
                            />
                        </div>
                        <span className="font-display text-2xl text-gold">
                            {section.value}<span className="text-sm text-sand/30">/{section.max ?? 13}</span>
                        </span>
                    </div>
                </div>
            );

        case 'taste_profile':
            return (
                <div className="bg-sand/8 rounded-3xl p-8 border border-sand/10">
                    <h3 className="font-display text-2xl uppercase mb-6 text-sand">Taste Profile</h3>
                    <div className="space-y-4">
                        {section.bitterness != null && <TasteBar label="Bitterness" value={section.bitterness} />}
                        {section.acidity != null && <TasteBar label="Acidity" value={section.acidity} />}
                        {section.roastiness != null && <TasteBar label="Roastiness" value={section.roastiness} />}
                        {section.body != null && <TasteBar label="Body" value={section.body} />}
                        {section.sweetness != null && <TasteBar label="Sweetness" value={section.sweetness} />}
                    </div>
                </div>
            );

        case 'aromatic_notes':
            return (
                <div className="bg-sand rounded-3xl p-6 text-ink">
                    <p className="text-[10px] font-bold tracking-widest uppercase opacity-60 mb-4">Aromatic Notes</p>
                    <div className="flex flex-wrap gap-2">
                        {section.notes.map((note) => (
                            <span key={note} className="bg-ink/10 text-ink text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-ink/10">
                                {note}
                            </span>
                        ))}
                    </div>
                </div>
            );

        case 'feature_list':
            return (
                <div className="bg-sand/8 rounded-3xl p-8 border border-sand/10">
                    <h3 className="font-display text-2xl uppercase mb-4 text-sand">{section.title}</h3>
                    <ul className="space-y-2">
                        {section.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-sand/70">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            );

        case 'specs_table':
            return (
                <div className="bg-sand/8 rounded-3xl border border-sand/10 overflow-hidden">
                    <div className="px-8 py-5 border-b border-sand/10">
                        <h3 className="font-display text-2xl uppercase text-sand">{section.title}</h3>
                    </div>
                    {section.rows.map((row, i) => (
                        <div key={i} className={`flex justify-between items-center px-8 py-4 ${i % 2 === 0 ? 'bg-sand/5' : ''}`}>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-cocoa">{row.label}</span>
                            <span className="text-sm font-bold text-sand">{row.value}</span>
                        </div>
                    ))}
                </div>
            );

        case 'ingredients':
            return (
                <div className="bg-sand/8 rounded-3xl p-8 border border-sand/10">
                    <h3 className="font-display text-2xl uppercase mb-4 text-sand">{section.title}</h3>
                    <div className="flex flex-wrap gap-2">
                        {section.items.map((item, i) => (
                            <span key={i} className="bg-sand/10 px-3 py-1.5 rounded-full text-xs font-bold text-sand/70 border border-sand/15">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            );

        case 'allergens':
            return (
                <div className="bg-amber-500/10 rounded-3xl p-6 border border-amber-500/20">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-3">⚠ Contains Allergens</p>
                    <div className="flex flex-wrap gap-2">
                        {section.items.map((item, i) => (
                            <span key={i} className="bg-amber-500/15 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-amber-500/25">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            );

        case 'pairing':
            return (
                <div className="bg-sand/8 rounded-3xl p-8 border border-sand/10">
                    <h3 className="font-display text-2xl uppercase mb-4 text-sand">{section.title}</h3>
                    <div className="flex flex-wrap gap-3">
                        {section.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-sand/10 px-4 py-2.5 rounded-2xl border border-sand/15">
                                <span className="text-xl">{item.emoji}</span>
                                <span className="text-xs font-bold text-sand/70">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'rich_text': {
            // Detect if content is HTML or markdown
            const isHtml = section.content.trim().startsWith('<');
            const html = isHtml ? section.content : marked.parse(section.content, { async: false }) as string;
            return (
                <div className="bg-sand/8 rounded-3xl p-8 border border-sand/10">
                    {section.title && <h3 className="font-display text-2xl uppercase mb-4 text-sand">{section.title}</h3>}
                    <RichTextBody html={html} />
                </div>
            );
        }

        case 'custom':
            return (
                <div className="bg-sand/8 rounded-3xl p-8 border border-sand/10">
                    <h3 className="font-display text-2xl uppercase mb-5 flex items-center gap-2 text-sand">
                        {section.icon && <span>{section.icon}</span>}
                        {section.title}
                    </h3>
                    <div className="space-y-3">
                        {section.fields.map((field) => (
                            <div key={field.id} className="flex items-center justify-between py-3 border-b border-sand/10 last:border-0">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-cocoa">{field.label}</span>
                                <span className="text-sm font-bold text-sand">
                                    {field.fieldType === 'boolean'
                                        ? (field.value ? '✓ Yes' : '✕ No')
                                        : field.fieldType === 'list'
                                            ? (field.value as string[]).join(', ')
                                            : String(field.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        default:
            return null;
    }
}

// ── Specs Tab renderer — used on the detail page ──────────────────────────────
export function SpecsTabRenderer({ specs }: { specs: { label: string; value: string }[] }) {
    if (!specs.length) return null;
    return (
        <div className="bg-sand/8 rounded-3xl border border-sand/10 overflow-hidden">
            {specs.map((row, i) => (
                <div key={i} className={`flex justify-between items-center px-8 py-4 ${i % 2 === 0 ? 'bg-sand/5' : ''}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cocoa">{row.label}</span>
                    <span className="text-sm font-bold text-sand">{row.value}</span>
                </div>
            ))}
        </div>
    );
}

// ── Description renderer — markdown or HTML ───────────────────────────────────
export function DescriptionRenderer({ content }: { content: string }) {
    const html = useMemo(() => {
        if (!content) return '';
        const isHtml = content.trim().startsWith('<');
        return isHtml ? content : marked.parse(content, { async: false }) as string;
    }, [content]);

    return <RichTextBody html={html} />;
}
